const aws = require('aws-sdk');
const s3 = new aws.S3();
const db = new aws.DynamoDB();
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
        const category = fields[3].trim().toLowerCase();
        const year_created = fields[4].trim();
        const artist = 'Olga Gorman';
        const destination_bucket = 'optimized-portfolio';

	let promises = [];

	razor.shaves.forEach(shave => {
		const filename = [title, 'by', artist, year_created].join(' ') + '.jpg';
                const path = [shave.style, category, filename].join('/');
		const primary_key = source_filename + ' ' + shave.style;
                const s3url = encodeURI('https://s3.amazonaws.com/' + destination_bucket + '/' + path);

		let delete_entry = db.deleteItem({
			Key: { S: primary_key },
			TableName: "artwork"
		}).promise();
		promises.push(delete_entry);

		let delete_image = delete_entry.then(response => {
			console.log(response);
			return s3.deleteObject({
				Bucket: 'artwork',
				Key: path
			});
		});
		promises.push(delete_image);
	});

	return Promise.all(promises);
};
