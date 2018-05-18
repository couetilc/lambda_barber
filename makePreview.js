const aws = require('aws-sdk');
const s3 = new aws.S3();
const db = new aws.DynamoDB();
const sharp = require('sharp');

exports.handler = async (event, context) => {
	console.log(JSON.stringify(event));
	console.log(JSON.stringify(context));

	const key = decodeURIComponent(event.Records[0].s3.object.key);
	const source_bucket = decodeURIComponent(event.Records[0].s3.bucket.name);
	const event_time = decodeURIComponent(event.Records[0].eventTime);
	const date_added = event_time.substring(0, event_time.lastIndexOf('.')); //keep seconds
	const source_filename = key.replace(/\+/g, ' ');

	/* Source Filename Format: "[RANK]<TITLE>(<CATEGORY>, <YEAR>)" */
	const parseMetadata = /([0-9]*)[ \t]*(.*)[\(](.*),(.*?)[\)]*\.(?=[^.]*$)/g;
	const fields = parseMetadata.exec(source_filename);
	const rank = !fields[1] || fields[1] === '' ? '0' : fields[1];
	const title = fields[2].trim();
	const category = fields[3].trim();
	const year_created = fields[4].trim();

	const form = 'preview';
	const artist = 'Olga Gorman';
	const destination_filename = [title, 'by', artist, year_created].join(' ');
	const path = [form, category, destination_filename].join('/');
	const destination_bucket = 'optimized-portfolio';
	const s3url = encodeURI('https://s3.amazonaws.com/' + destination_bucket + '/' + path);

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

	return await s3.getObject({Bucket: source_bucket, Key: source_filename}).promise()
		.then(object => getPreview(object.Body))
		.then(buffer => s3.putObject({
			Body: buffer,
			Bucket: destination_bucket,
			Key: path,
			ACL: 'public-read'
		}).promise())
		.then(() => {
			const metadata_query = {
				Item: {
					"key": { S: source_filename },
					"rank": { S: rank },
					"title": { S: title },
					"artist": { S: artist },
					"category": { S: category.toLowerCase() },
					"form": { S: form },
					"year_created": { S: year_created },
					"date_added": { S: date_added },
					"s3url": { S: s3url }
				},
				TableName: 'test_artwork'
			};
			return db.putItem(metadata_query).promise();
		});
};
