const aws = require('aws-sdk');
const lambda = new aws.Lambda({apiVersion: '2015-03-31'});
const db = new aws.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = async event => {
	console.log(JSON.stringify(event));
	/* Iterate through Records and grab all categories changed 	*/
	/* For corresponding category of artwork:
	 * 	-> pull information from artwork database
 	 *	-> create context object
  	 *	-> invoke lambda to render HTML page 			*/
	const categories = [...new Set(event.Records.map(rec => {
		if (rec.dynamodb.hasOwnProperty("NewImage")) {
			return rec.dynamodb.NewImage.category.S;
		} else {
			return rec.dynamodb.OldImage.category.S;
		}
	}))];
	console.log(JSON.stringify(categories));
/*
	await Promise.all(categories.map(category => new Promise(
		(resolve, reject) => { db.scan({
			TableName: "artwork",
			IndexName: "category",
			FilterExpression: "#C = :c",
			ProjectionExpression: "rank, title, url_preview, url_original, year_created",
			ExpressionAttributeNames: {
				"C": "category"
			},
			ExpressionAttributeValues: { ":c": { S: category }}
		}).promise().then(data => resolve(
			console.log(JSON.stringify(data))
		))}
	)));
*/
	return 0;
};
