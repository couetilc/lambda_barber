const aws = require('aws-sdk');
const lambda = new aws.Lambda({apiVersion: '2015-03-31'});
const db = new aws.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = async event => {
	console.log(JSON.stringify(event));
	/* pull information from categories database 			*/
	/* invoke lambda function (touchupIndex.js) to render home page *
	 *	(pass in nunjucks parameters) 				*/
};
