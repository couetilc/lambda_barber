const aws = require('aws-sdk');
const s3 = new aws.S3();
const sharp = require('sharp');

exports.handler = async (event, context) => {
	console.log(JSON.stringify(event));
	console.log(JSON.stringify(context));

	const bucket = decodeURI(event.Records[0].s3.bucket.name);
	const key = decodeURI(event.Records[0].s3.object.key);
	const destination = 'optimized-portfolio';
	const name = ['preview', key].join('/');

	const getPreview = image => sharp(image)
		.jpeg({
			quality: 85,
			progress: true,
			chromeSubsampling: '4:2:2',
			force: true
		})
		.resize(200, 160)
		.min()
		.toFormat('jpeg')
		.toBuffer();

	return await s3.getObject({Bucket: bucket, Key: key}).promise()
		.then(object => getPreview(object.Body))
		.then(buffer => s3.putObject({
			Body: buffer,
			Bucket: destination,
			Key: name
		}).promise());
};
