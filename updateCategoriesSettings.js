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

		return Promise.all(
			settings.map(entry => new Promise((resolve, reject) => {
				const getparam = {
					Key: { "key": { 
						S: [entry.category, entry.thumbnail].join(":")
					}},
					TableName: "artwork"
				};
				return db.getItem(getparam).promise()
				.then(data => ({
					Item: {
						"category": { S: entry.category },
						"thumbnail": { S: data.Item.url_thumbnail.S },
						"background": { S: data.Item.url_background.S },
						"order": { N: entry.order.toString() },
						"updated_on": { S: event.time },
						"category_url": { 
							S: ["category/", entry.category, ".html"]
								.join("")
								.replace(" ", "_")
						}
					},
					TableName: "categories"
				}))
				.then(putparam => resolve(db.putItem(putparam).promise()))
				.catch(err => reject(err));
			}))
		);
	})
	.catch(err => console.error(err));
