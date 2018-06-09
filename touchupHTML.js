const aws = require('aws-sdk');
const s3 = aws.S3();
const db = aws.DynamoDB();

exports.handler = event => {
	console.log(JSON.stringify(event));

	/* Pull all database information */

	/* Re-render all pages using nunjucks			*/
	/*	-PUT rendered pages to optimized portfolio	*/
};
