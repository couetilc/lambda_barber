ROLE="arn:aws:iam::962610988997:role/s3_dynamo_4lambda"
USER="962610988997"
SRCBUCKET="arn:aws:s3:::portfolio-originals"
ZIPPATH="fileb://~/lambda_barber/"
RUNTIME="nodejs8.10"
TIMEOUT=60
MEMORYSIZE=256

.PHONY: zip 
zip: shaveImage.zip trimDatabase.zip razorSharp.js
%.zip: %.js
	zip -rq "$*"".zip" "$*"".js" razorSharp.js node_modules 

.PHONY: create
create: c.shaveImage c.trimDatabase razorSharp.js
c.%: %.zip
	aws lambda create-function \
		--function-name "$*" \
		--runtime $(RUNTIME) \
		--role $(ROLE) \
		--handler "$*".handler \
		--zip-file $(ZIPPATH)"$*"".zip" \
		--timeout $(TIMEOUT) \
		--memory-size $(MEMORYSIZE) \

.PHONY: update
update: u.shaveImage u.trimDatabase razorSharp.js
u.%: %.zip
	aws lambda update-function-code \
		--function-name "$*" \
		--zip-file $(ZIPPATH)"$*"".zip"

.PHONY: delete
delete: d.shaveImage d.trimDatabase razorSharp.js
d.%: %.zip
	aws lambda delete-function \
		--function-name "$*"

.PHONY: clean
clean:
	rm -f *.zip
