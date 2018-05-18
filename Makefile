ROLE="arn:aws:iam::962610988997:role/s3_dynamo_4lambda"
USER="962610988997"
SRCBUCKET="arn:aws:s3:::portfolio-originals"
ZIPPATH="fileb://~/lambda_barber/"
RUNTIME="nodejs8.10"
TIMEOUT=15
MEMORYSIZE=192

.PHONY: zip 
zip: makePreview.zip makeOriginal.zip makeBackground.zip makeThumbnail.zip deleteImage.zip
%.zip: %.js
	zip -rq "$*"".zip" "$*"".js" node_modules 

.PHONY: create
create: c.makePreview c.makeOriginal c.makeBackground c.makeThumbnail c.deleteImage
c.%: %.zip
	aws lambda create-function \
		--function-name "$*" \
		--runtime $(RUNTIME) \
		--role $(ROLE) \
		--handler "$*".handler \
		--zip-file $(ZIPPATH)"$*"".zip" \
		--timeout $(TIMEOUT) \
		--memory-size $(MEMORYSIZE) \
	&& aws lambda add-permission \
		--function-name "$*" \
		--region "us-east-1" \
		--statement-id "12345" \
		--action "lambda:InvokeFunction" \
		--principal s3.amazonaws.com \
		--source-arn $(SRCBUCKET) \
		--source-account $(USER) \
	&& aws s3api put-bucket-notification-configuration \
		--bucket $(SRCBUCKET)
		--notification-configuration 

.PHONY: update
update: u.makePreview u.makeOriginal u.makeBackground u.makeThumbnail u.deleteImage
u.%: %.zip
	aws lambda update-function-code \
		--function-name "$*" \
		--zip-file $(ZIPPATH)"$*"".zip"

.PHONY: delete
delete: d.makePreview d.makeOriginal d.makeBackground d.makeThumbnail d.deleteImage
d.%: %.zip
	aws lambda delete-function \
		--function-name "$*"

.PHONY: clean
clean:
	rm -f *.zip
