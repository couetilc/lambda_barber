const aws = require('aws-sdk');
const s3 = new aws.S3();
const db = new aws.DynamoDB();
const sharp = require('sharp');

exports.handler = async (event, context) => {
	console.log(JSON.stringify(event));
	console.log(JSON.stringify(context));

	const form = 'preview';
	const category = 'Mixed Media';
	const rank = '1';
	const bucket = decodeURI(event.Records[0].s3.bucket.name);
	const key = decodeURI(event.Records[0].s3.object.key);
	const date_added = decodeURI(event.Records[0].eventTime);
	const month_created = 'April';
	const year_created = '2018';
	const path = [form, key].join('/');
	const destination = 'optimized-portfolio';
	const bucket_endpoint = 'http://optimized-portfolio.s3-website-us-east-1.amazonaws.com/';

	const getPreview = image => sharp(image)
		.jpeg({
			quality: 85,
			progress: true,
			chromeSubsampling: '4:2:2',
			force: true
		})
		.resize(200, 160)
		.min()
		.toFormat('jpeg')
		.toBuffer();

	const metadata_query = {
		Item: {
			"rank": { S: rank },
			"title": { S: key },
			"artist": { S: 'Olga Gorman' },
			"category": { S: category },
			"form": { S: form },
			"month_created": { S: month_created },
			"year_created": { S: year_created },
			"date_added": { S: date_added },
			"s3url": { S: bucket_endpoint + path }
		},
		TableName: 'test_artwork'
	};

	return await s3.getObject({Bucket: bucket, Key: key}).promise()
		.then(object => getPreview(object.Body))
		.then(buffer => s3.putObject({
			Body: buffer,
			Bucket: destination,
			Key: path 
		}).promise())
		.then(() => db.putItem(metadata_query).promise());
};
