const aws = require('aws-sdk');
const s3 = new aws.S3({apiVersion: '2006-03-01'});
const lambda = new aws.Lambda({apiVersion: '2015-03-31'});
const yaml = require('js-yaml');

exports.handler = async event => {
	console.log(event);

	s3.getObject({
		Bucket: "portfolio-originals",
		Key: "settings/main_page.yaml"
	}).promise()
	.then(response => {
		const settings = yaml.safeLoad(Buffer
			.from(response.Body)
			.toString());
		for (entry of settings) {
			const dbparam = {Item: {}, TableName: "categories"};
		}
	})
	/* Pull info from database using YAML settings */
	/* Render template using nunjucks */
	.catch(err => console.error(err));
};
