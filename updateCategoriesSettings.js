const aws = require('aws-sdk');
const s3 = new aws.S3({apiVersion: '2006-03-01'});
const db = new aws.DynamoDB({apiVersion: '2012-08-10'});
const yaml = require('js-yaml');

exports.handler = async event => s3.getObject({
		Bucket: "portfolio-originals",
		Key: "settings/main_page.yaml"
	}).promise()
	.then(response => {
		const settings = yaml.safeLoad(Buffer
			.from(response.Body)
			.toString());
		console.log(JSON.stringify(settings));

		resolve(settings.map(entry => ({
			Item: {
				"category": { S: entry.category },
				"thumbnail": { S: entry.thumbnail },
				"position": { S: entry.position }
			},
			TableName: "categories"
		})));
	})
	.then(dbputs => Promise.all(
		dbputs.map(putparam => db.putItem(putparam).promise())))
	.catch(err => console.error(err));
