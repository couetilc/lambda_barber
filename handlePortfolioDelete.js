const aws = require('aws-sdk');
const lambda = new aws.Lambda({apiVersion: '2015-03-31'});

exports.handler = async event => {
	console.log(JSON.stringify(event));

	const record = event.Records[0];
	/* object of size zero indicates a folder */
	if (record.s3.object.size === 0) return;

	const key = decodeURIComponent(record.s3.object.key);

	if (key.indexOf("portfolio/") === 0) {
		return lambda.invoke({
			FunctionName: "trimDatabase",
			InvocationType: "Event",
			Payload: JSON.stringify({
				"key": key.replace("portfolio/", "")
			})
		}).promise();
	}
};
