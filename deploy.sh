#!/bin/bash
zip -r shaveImage.zip shaveImage.js node_modules

aws lambda update-function-code \
	--function-name shaveImage \
	--zip-file fileb://~/dv/lambda_barber/shaveImage.zip

#aws lambda create-function \
#	--function-name shaveImage \
#	--runtime nodejs6.10 \
#	--role arn:aws:iam::962610988997:role/s3_4lambda \
#	--handler shaveImage.handler \
#	--zip-file fileb://~/dv/lambda_barber/shaveImage.zip
