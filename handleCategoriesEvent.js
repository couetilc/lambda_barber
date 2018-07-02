const aws = require('aws-sdk');
const lambda = new aws.Lambda({apiVersion: '2015-03-31'});
const db = new aws.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = async event => db.scan({
                TableName: "categories",
                Select: "ALL_ATTRIBUTES"
        }).promise().then(data => data.Items.map(item => ({
                "url": item.category_url.S,
                "name": item.category.S,
                "thumbnail": item.thumbnail.S,
		"background": item.background.S,
                "order": item.order.N
        }))).then(list => ({
                "categories": list.sort(
                        (a, b) => parseInt(a.order, 10) - parseInt(b.order, 10)
        )})).then(context => lambda
		.invoke({
			FunctionName: "touchupIndex",
			InvocationType: "Event",
			Payload: JSON.stringify({context: context})
		}).promise())
	.catch(err => console.error(err))
