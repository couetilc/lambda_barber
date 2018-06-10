const aws = require('aws-sdk');
const s3 = new aws.S3({apiVersion: '2006-03-01'});
const db = new aws.DynamoDB({apiVersion: '2012-08-10'});
const njk = require('nunjucks');

exports.handler = async event => {
	//console.log(JSON.stringify(event));

	return s3.getObject({
		Bucket: "portfolio-originals",
		Key: "templates/" + "skeleton.njk"
	}).promise()
	.then(response => {
		const buf = response.Body.data;
		//console.log(JSON.stringify(response));
		return console.log(Buffer.from(buf)
			.toString());
	})
	.catch(err => console.error(err));

	/* Pull all database information */

	/* Re-render all pages using nunjucks			*/
	/*	-PUT rendered pages to optimized portfolio	*/
};
