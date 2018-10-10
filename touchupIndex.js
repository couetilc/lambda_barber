const aws = require('aws-sdk');
const s3 = new aws.S3({apiVersion: '2006-03-01'});
const db = new aws.DynamoDB({apiVersion: '2012-08-10'});
const njk = require('nunjucks');

exports.handler = async event => s3.getObject({
		Bucket: "portfolio-originals",
		Key: "templates/" + "main.njk"
	}).promise()
	.then(response => new Buffer(
		njk.renderString(
			Buffer.from(response.Body).toString(), 
			event.context
	)))
	.then(template => s3.putObject({
		Bucket: "olgaanastasiaart.com",
		Key: "index.html",
		ContentType: "text/html",
		Body: template
	}).promise())
	.catch(err => console.error(err));
