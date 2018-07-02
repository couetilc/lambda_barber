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
	const category_url = ["category/", event.category, ".html"]
		.join("")
		.replace(" ", "+");

	if (event.artwork === undefined || event.artwork.length == 0) {
		return s3.deleteObject({
			Bucket: "optimized-portfolio",
			Key: category_url
		});
	}

	return s3.getObject({
		Bucket: "portfolio-originals",
		Key: "templates/" + "category.njk"
	}).promise()
	.then(response => new Buffer(
		njk.renderString(
			Buffer.from(response.Body).toString(),
			event
	)))
	.then(template => s3.putObject({
		Bucket: "optimized-portfolio",
		Key: category_url,
		ACL: "public-read",
		ContentType: "text/html",
		Body: template
	}).promise())
	.catch(err => console.error(err));
};
