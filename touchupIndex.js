const aws = require('aws-sdk');
const s3 = new aws.S3({apiVersion: '2006-03-01'});
const db = new aws.DynamoDB({apiVersion: '2012-08-10'});
const njk = require('nunjucks');

exports.handler = async event => {
	console.log(JSON.stringify(event));
	/* grab nunjucks parameters from event 		*/
	/* pull base template from private database 	*/
	/* render home page using nunjucks 		*/
	/* put home page into public s3 bucket 		*/

	return s3.getObject({
		Bucket: "portfolio-originals",
		Key: "templates/" + "skeleton.njk"
	}).promise()
	.then(response => console.log(
		njk.renderString(Buffer.from(response.Body).toString())
	))
	.catch(err => console.error(err));
};
