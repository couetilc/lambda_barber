const aws = require('aws-sdk');
const s3 = new aws.S3();
const sharp = require('sharp');

exports.handler = event => {
	const bucket = event.detail.requestParameters.bucketName;
	const key = event.detail.requestParameters.key;

	console.log(event);
	console.log([bucket, key]);

	const destination = 'optimized-portfolio';
	exports.makeThumbnail(bucket, destination, key);
};

exports.makeThumbnail = (source, destination, key) => {
	const getSharpThumbnail = image => sharp(image)
		.jpeg({
			quality: 85,
			progress: true,
			chromeSubsampling: '4:2:2',
			force: true
		})
		.resize(200, 160)
		.crop('center')
		.toFormat('jpeg');

	s3.getObject({Bucket: source, Key: key}).promise()
		.then(object => getSharpThumbnail(object.Body).toBuffer())
		.then(buffer => s3.putObject({
			Body: buffer,
			Bucket: destination,
			Key: 'thumbnail/' + key
		}).promise())
		.then(msg => console.log(['success', msg]))
		.catch(err => console.log(err));
};
