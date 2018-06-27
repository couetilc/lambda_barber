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
	const categories = new Set(
		event.Records.map(rec => dynamoDB.NewImage.category.S));

	categories.forEach(category => {
		db.scan({
			TableName: "artwork",
			ExpressionAttributeNames: {
				"
			}
		});
	});
};
