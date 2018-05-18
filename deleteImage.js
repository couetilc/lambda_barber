const aws = require('aws-sdk');
const s3 = new aws.S3();
const db = new aws.DynamoDB();

exports.handler = async (event, context) => {
	console.log(JSON.stringify(event));
	console.log(JSON.stringify(context));

	const key = decodeURIComponent(event.Records[0].s3.object.key);
	const source_filename = key.replace(/\+/g, ' ');

	/* Source Filename Format: "[RANK]<TITLE>(<CATEGORY>, <YEAR>)" */
	const parseMetadata = /([0-9]*)[ \t]*(.*)[\(](.*),(.*?)[\)]*\.(?=[^.]*$)/g;
	const fields = parseMetadata.exec(source_filename);
	const rank = !fields[1] || fields[1] === '' ? '0' : fields[1];
	const title = fields[2].trim();
	const category = fields[3].trim();
	const year_created = fields[4].trim();

	const artist = 'Olga Gorman';
	const forms = ['preview', 'thumbnail', 'background', 'original'];
	const destination_filename = [title, 'by', artist, year_created].join(' ');
	const destination_bucket = 'optimized-portfolio';
	
	const delete_images_param  = {
		Bucket: 'optimized-portfolio',
		Delete: { 
			Objects: forms.map(f => {
				return { Key: [f, category, destination_filename].join('/') };
	})}};

	const delete_entry_param = { 
		Key: { 'key': { S: source_filename } },
		TableName: 'artwork'
	};

	return await s3.deleteObjects(delete_images_param).promise()
		.then(result => { 
			console.log(result);
			return db.deleteItem(delete_entry_param).promise();
		}).catch(error => {
			console.log(error);
			return error;
		});
};
