const aws = require('aws-sdk');
const s3 = new aws.S3({apiVersion: '2006-03-01'});
const db = new aws.DynamoDB({apiVersion: '2012-08-10'});
const sharp = require('sharp');
const razor = require('./razorSharp.js');

async function shaveImage(param) {
	return s3.getObject(param.s3get).promise()
	.then(response => param.cut(response.Body))
	.then(image => {
		param.s3put.Body = image;
		return s3.putObject(param.s3put).promise();
	})
	.then(() => db.updateItem(param.dbput).promise())
	.catch(err => console.error(err));
}

exports.handler = async event => {
	console.log(JSON.stringify(event));

	const source_filename = event.key.replace(/\+/g, ' ');
	const source_bucket = event.source_bucket;
	const date_added = event.time
		.substring(0, event.time.lastIndexOf('.')); //keep seconds

	/* Source Filename Format: "[RANK]<TITLE>(<CATEGORY>, <YEAR>)" */
	const parseMetadata = /(.*?)[\/]([0-9]*)[ \t]*(.*)[\(](.*?)[\)]*\.(?=[^.]*$)/g;
	const fields = parseMetadata.exec(source_filename);
	const category = fields[1].trim().toLowerCase();
	const rank = !fields[2] || fields[2] === '' ? '999999999999' : fields[2];
	const title = fields[3].trim();
	const year_created = fields[4].trim();
	const artist = 'Olga Gorman';
	const destination_bucket = 'optimized-portfolio';

	const job_parameters = razor.shaves.map(shave => {
		const filename = [title, 'by', artist, year_created]
			.join(' ') + '.jpg';
		const path = ["media", shave.style, category, filename]
			.join('/');
		const primary_key = [category, title]
			.join(':');
		const s3url = encodeURI('https://s3.amazonaws.com/' 
					+ destination_bucket + '/' + path);
		const modified_attribute = "url_" + shave.style;
		const params = { 
			s3get: {
				Bucket: source_bucket,
				Key: "portfolio/" + source_filename
			},
			s3put: {
				Bucket: destination_bucket,
				Key: path,
				ACL: 'public-read'
			},
			cut: shave.cut,
			dbput: {
				Key: { "key": { S: primary_key }},
				ExpressionAttributeValues: {
					":r": { S: rank },
					":t": { S: title },
					":a": { S: artist },
					":c": { S: category },
					":y": { S: year_created },
					":d": { S: date_added },
					":u": { S: s3url }
				},
				ExpressionAttributeNames: {
					"#R": "rank",
					"#T": "title",
					"#A": "artist",
					"#C": "category",
					"#Y": "year_created",
					"#D": "date_added",
					"#U": modified_attribute
				},
				UpdateExpression: [
					"SET #R = :r",
					"#T = :t", 
					"#A = :a", 
					"#C = :c", 
					"#Y = :y", 
					"#D = :d", 
					"#U = :u", 
				].join(", "),
				TableName: "artwork"
			}
		};
		return params;
	});

	return Promise.all(job_parameters.map(job => shaveImage(job)));
};
