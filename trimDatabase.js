const aws = require('aws-sdk');
const s3 = new aws.S3();
const db = new aws.DynamoDB();
const razor = require('./razorSharp.js');

async function trimDatabase(param) {
	return db.deleteItem(param.dbdelete).promise()
		.then(() => s3.deleteObject(param.s3delete).promise())
		.catch(err => console.error(err));
}

exports.handler = async event => {
	console.log(JSON.stringify(event));
	
        const source_filename = event.key.replace(/\+/g, ' ');
	const target_bucket = 'optimized-portfolio';
	const target_table = 'artwork';

	/* Source Filename Format: "[RANK]<TITLE>(<CATEGORY>, <YEAR>)" */
        const parseMetadata = /([0-9]*)[ \t]*(.*)[\(](.*),(.*?)[\)]*\.(?=[^.]*$)/g;
        const fields = parseMetadata.exec(source_filename);
        const title = fields[2].trim();
        const category = fields[3].trim().toLowerCase();
        const year_created = fields[4].trim();
        const artist = 'Olga Gorman';

	const job_parameters = razor.shaves.map(shave => {
		const filename = [title, 'by', artist, year_created]
			.join(' ') + '.jpg';
		const path = ["media", shave.style, category, filename]
			.join('/');
		const primary_key = source_filename + ' ' + shave.style;

		return {
			dbdelete: {
				Key: { "key": { S: primary_key } },
				TableName: target_table
			},
			s3delete: {
				Bucket: target_bucket,
				Key: path
			}
		};
	});

	return await Promise.all(job_parameters.map(job => trimDatabase(job)));
};
