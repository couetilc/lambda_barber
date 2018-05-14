const aws = require('aws-sdk');
const s3 = new aws.S3();
const sharp = require('sharp');

exports.handler = (event, context) => {
	console.log(JSON.stringify(event));
	console.log(JSON.stringify(context));

	const bucket = decodeURI(event.Records[0].s3.bucket.name);
	const key = decodeURI(event.Records[0].s3.object.key);

	const modifications = {
		"thumbnail": image => sharp(image)
			.jpeg({
				quality: 85,
				progress: true,
				chromeSubsampling: '4:2:2',
				force: true
			})
			.resize(200, 160)
			.crop('center')
			.toFormat('jpeg')
			.toBuffer(),
		"preview": image => sharp(image)
			.jpeg({
				quality: 85,
				progress: true,
				chromeSubsampling: '4:2:2',
				force: true
			})
			.resize(200, 160)
			.min()
			.toBuffer()
	};

	const destination = 'optimized-portfolio';
	for (let mod in modifications) {
		if (modifications.hasOwnProperty(mod)) {
			exports.modify(mod, modifications[mod], bucket, destination, key);
		}
	}
};

exports.modify = (type, modifyImage, source, destination, key) => {
	s3.getObject({Bucket: source, Key: key}).promise()
		.then(object => modifyImage(object.Body))
		.then(buffer => {
			return s3.putObject({
				Body: buffer,
				Bucket: destination,
				Key: [type, key].join('/')
			}).promise();
		})
		.then(msg => console.log(msg))
		.catch(err => console.log(err));
};
