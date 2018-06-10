const aws = require('aws-sdk');
const s3 = new aws.S3({apiVersion: '2006-03-01'});
const db = new aws.DynamoDB({apiVersion: '2012-08-10'});
const sharp = require('sharp');
const razor = require('./razorSharp.js');

exports.handler = event => {
	console.log(JSON.stringify(event));

	const source_filename = event.key.replace(/\+/g, ' ');
	const source_bucket = event.source_bucket;
	const date_added = event.time
		.substring(0, event.time.lastIndexOf('.')); //keep seconds

	/* Source Filename Format: "[RANK]<TITLE>(<CATEGORY>, <YEAR>)" */
	const parseMetadata = /([0-9]*)[ \t]*(.*)[\(](.*),(.*?)[\)]*\.(?=[^.]*$)/g;
	const fields = parseMetadata.exec(source_filename);
	const rank = !fields[1] || fields[1] === '' ? '0' : fields[1];
	const title = fields[2].trim();
	const category = fields[3].trim().toLowerCase();
	const year_created = fields[4].trim();
	const artist = 'Olga Gorman';
	const destination_bucket = 'optimized-portfolio';

	let promises = [];
	
	razor.shaves.forEach(shave => {
		const filename = [title, 'by', artist, year_created]
			.join(' ') + '.jpg';
		const path = ["media", shave.style, category, filename]
			.join('/');
		const primary_key = source_filename + ' ' + shave.style;
		const s3url = encodeURI('https://s3.amazonaws.com/' + destination_bucket + '/' + path);

		let receive_image = s3.getObject({
			Bucket: source_bucket, 
			Key: "portfolio/" + source_filename
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
				const metadata_query = {
					Item: {
						"key": { S: primary_key },
						"rank": { S: rank },
						"title": { S: title },
						"artist": { S: artist },
						"category": { S: category },
						"form": { S: shave.style },
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
