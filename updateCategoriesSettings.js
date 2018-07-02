const aws = require('aws-sdk');
const s3 = new aws.S3({apiVersion: '2006-03-01'});
const db = new aws.DynamoDB({apiVersion: '2012-08-10'});
const yaml = require('js-yaml');

exports.handler = async event => s3.getObject({
		Bucket: "portfolio-originals",
		Key: "settings/main_page.yaml"
	}).promise().then(response => {
		const settings = yaml.safeLoad(
			Buffer.from(response.Body).toString()
		);

		const dbgets = settings.map(entry => ({
			Key: { "key": { 
				S: [entry.category, entry.thumbnail].join(':') 
			}},
			TableName: "artwork"
		}));

		return Promise.all(dbgets.map(dbget => db.getItem(dbget).promise()
			.then(data => ({ 
				Item: {
					"category": { S: entry.category },
					"thumbnail": { S: data.Item.s3url.S },
					"order": { N: entry.order.toString() },
					"updated_on": { S: event.time },
					"category_url": { S: "category/" + 
						encodeURIComponent(
							entry.category + ".html"
						)
					}
				},
				TableName: "categories" 
			}))
		));
	})
	.then(dbputs => Promise.all(
		dbputs.map(putparam => db.putItem(putparam).promise())
	))
	.catch(err => console.error(err));
