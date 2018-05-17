const aws = require('aws-sdk');
const s3 = new aws.S3();
const db = new aws.DynamoDB();
const sharp = require('sharp');

exports.handler = async (event, context) => {
	console.log(JSON.stringify(event));
	console.log(JSON.stringify(context));

	const source_filename = decodeURI(event.Records[0].s3.object.key);
	const source_bucket = decodeURI(event.Records[0].s3.bucket.name);
	const key = decodeURI(event.Records[0].s3.object.key);
	const date_added = decodeURI(event.Records[0].eventTime);

	//Source Filename Format: "[RANK]<TITLE>(<CATEGORY>, <YEAR>)"
	const parse = /(\d*)\s*(.*)\((.*),(.*?)\)*\s*$/g;
	const [rank, title, category, year_created] = parse.exec(source_filename);

	const month_created = '4';
	const form = 'preview';
	const artist = 'Olga Gorman';
	const destination_filename = [title, 'by', artist, date_added].join(' ');
	const path = [form, category, destination_filename].join('/');
	const destination_bucket = 'optimized-portfolio';
	const s3_endpoint = 'http://optimized-portfolio.s3-website-us-east-1.amazonaws.com/';
	if (!rank || rank === '') {
		rank = '0';
	}

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
			"key": { S: source_filename },
			"rank": { S: rank },
			"title": { S: title.trim() },
			"artist": { S: artist },
			"category": { S: category.trim().toLowerCase() },
			"form": { S: form },
			"month_created": { S: month_created },
			"year_created": { S: year_created.trim() },
			"date_added": { S: date_added },
			"s3url": { S: s3_endpoint + path }
		},
		TableName: 'test_artwork'
	};

	return await s3.getObject({Bucket: source_bucket, Key: key}).promise()
		.then(object => getPreview(object.Body))
		.then(buffer => s3.putObject({
			Body: buffer,
			Bucket: destination_bucket,
			Key: path 
		}).promise())
		.then(() => db.putItem(metadata_query).promise());
};
