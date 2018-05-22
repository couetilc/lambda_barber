const sharp = require('sharp');

exports.shaves = [
	{
		"style": "preview",
		"cut": image => sharp(image)
			.jpeg({
				quality: 85,
				progress: true,
				chromeSubsampling: '4:2:2',
				force: true
			})
			.resize(200, 160)
			.min()
			.toFormat('jpeg')
			.toBuffer()
	},
	{
		"style": "original",
		"cut": image => sharp(image)
			.jpeg({
				quality: 100,
				progress: true,
				chromeSubsampling: '4:4:4',
				force: true
			})
			.toFormat('jpeg')
			.toBuffer()
	},
	{
		"style": "thumbnail",
		"cut": image => sharp(image)
			.jpeg({
				quality: 85,
				progress: true,
				chromeSubsampling: '4:2:2',
				force: true
			})
			.resize(200, 160)
			.crop('center')
			.toFormat('jpeg')
			.toBuffer()
	},
	{
		"style": "background",
		"cut": image => sharp(image)
			.jpeg({
				quality: 95,
				progress: true,
				chromeSubsampling: '4:2:2',
				force: true
			})
			.resize(1920, 1080)
			.withoutEnlargement()
			.min()
			.toFormat('jpeg')
			.toBuffer()
	}
];
