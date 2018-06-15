const aws = require('aws-sdk');
const s3 = new aws.S3({apiVersion: '2006-03-01'});
const lambda = new aws.Lambda({apiVersion: '2015-03-31'});

exports.handler = async event => {
	console.log(JSON.stringify(event));

	const record = event.Records[0];
	/* object of size zero indicates a folder */
	if (record.s3.object.size === 0) return;

	const key = decodeURIComponent(record.s3.object.key);
	const source_bucket = decodeURIComponent(record.s3.bucket.name);
	const event_time = decodeURIComponent(record.eventTime);

	if (key.indexOf("portfolio/") === 0) {
		return lambda.invoke({
			FunctionName: "shaveImage",
			InvocationType: "Event",
			Payload: JSON.stringify({
				"key": key.replace("portfolio/", ""),
				"source_bucket": source_bucket,
				"time": event_time
			})
		}).promise();
	} else if (key.indexOf("templates") {
		
	} else if (key === "settings/main_page.yaml") {
		return lambda.invoke({
			FunctionName: "updateCategoriesSettings",
			InvocationType: "Event",
			Payload: JSON.stringify({
				"time": event_time
			})
		}).promise();
	} 
};
