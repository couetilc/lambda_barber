const aws = require('aws-sdk');
const lambda = new aws.Lambda({apiVersion: '2015-03-31'});
const db = new aws.DynamoDB({apiVersion: '2012-08-10'});

async function getCategoryArtwork(category) {
	return new Promise((resolve, reject) => db.scan({
		TableName: "artwork",
		ProjectionExpression: "#R, #T, #UP, #UO, #YC",
		ExpressionAttributeNames: {
			"#C": "category",
			"#R": "rank",
			"#T": "title",
			"#UP": "url_preview",
			"#UO": "url_original",
			"#YC": "year_created"
		},
		ExpressionAttributeValues: {":c": {S: category}},
		FilterExpression: "#C = :c"
	}).promise()
	.then(data => resolve(data.Items))
	.catch(err => reject(err)));
}

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

	return Promise.all(categories.map(category => getCategoryArtwork(category)
		.then(categorized_artwork => categorized_artwork.sort(
			(a, b) => parseInt(a.rank, 10) - parseInt(b.rank, 10)
		))
		.then(sorted_artwork => lambda.invoke({
			FunctionName: "touchupCategory",
			InvocationType: "Event",
			Payload: JSON.stringify({
				category: category,
				artwork: sorted_artwork
			})
		}).promise())
		.catch(err => console.error(err))
	))
};
