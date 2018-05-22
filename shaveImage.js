const aws = require('aws-sdk');
const s3 = new aws.S3();
const db = new aws.DynamoDB();
const sharp = require('sharp');
const razor = require('./razorSharp.js');

exports.handler = event => {
	console.log(JSON.stringify(event));

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
	const artist = 'Olga Gorman';
	const destination_bucket = 'optimized-portfolio';


	let promises = [];
	
	razor.shaves.forEach(shave => {
		const filename = [title, 'by', artist, year_created].join(' ') + '.jpg';
		const path = [shave.format, category, filename].join('/');
		const s3url = encodeURI('https://s3.amazonaws.com/' + destination_bucket + '/' + path);

		let receive_image = s3.getObject({
			Bucket: source_bucket, 
			Key: source_filename
		}).promise();
		promises.push(receive_image);

		receive_image.then(response => shave.cut(response.Body))
			.then(image => s3.putObject({
				Body: image,
				Bucket: destination_bucket,
				Key: path,
				ACL: 'public-read'
			}).promise())
			.then(() => {
				const primary_key = shave.format + ' ' + source_filename;
				const metadata_query = {
					Item: {
						"key": { S: primary_key },
						"rank": { S: rank },
						"title": { S: title },
						"artist": { S: artist },
						"category": { S: category.toLowerCase() },
						"form": { S: shave.format },
						"year_created": { S: year_created },
						"date_added": { S: date_added },
						"s3url": { S: s3url }
					},
					TableName: "artwork"
				};
				return db.putItem(metadata_query).promise();
			})
			.catch(error => console.log(error));
	});
};
