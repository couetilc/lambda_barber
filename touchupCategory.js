const aws = require('aws-sdk');
const s3 = new aws.S3({apiVersion: '2006-03-01'});
const njk = require('nunjucks');

exports.handler = async event => {
	console.log(JSON.stringify(event))
	/* grab artwork parameters from event object 
	 *	-> parameters should be for 1 category at a time 	*/
	/* pull category template from private s3 bucket		*/
	/* render specified category page HTML using nunjucks		*/
	/* put rendered HTML page into public s3 bucket			*/
};
