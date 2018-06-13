ROLE="arn:aws:iam::962610988997:role/s3_dynamo_4lambda"
USER="962610988997"
SRCBUCKET="arn:aws:s3:::portfolio-originals"
ZIPPATH="fileb://~/lambda_barber/"
RUNTIME="nodejs8.10"
TIMEOUT=60
MEMORYSIZE=256

.PHONY: zip 
zip: handlePortfolioPut.zip shaveImage.zip updateCategoriesSettings.zip handlePortfolioDelete.zip trimDatabases.zip handleCategoriesEvent.zip touchupIndex.zip handleArtworkEvent.zip touchupCategory.zip razorSharp.js
%.zip: %.js
	zip -rq "$*"".zip" "$*"".js" razorSharp.js node_modules 

.PHONY: create
create: c.handlePortfolioPut c.shaveImage c.updateCategoriesSettings c.handlePortfolioDelete c.trimDatabases c.handleCategoriesEvent c.touchupIndex c.handleArtworkEvent c.touchupCategory razorSharp.js
c.%: %.zip
	aws lambda create-function \
		--function-name "$*" \
		--runtime $(RUNTIME) \
		--role $(ROLE) \
		--handler "$*".handler \
		--zip-file $(ZIPPATH)"$*"".zip" \
		--timeout $(TIMEOUT) \
		--memory-size $(MEMORYSIZE)

.PHONY: update
update: u.handlePortfolioPut u.shaveImage u.updateCategoriesSettings u.handlePortfolioDelete u.trimDatabases u.handleCategoriesEvent u.touchupIndex u.handleArtworkEvent u.touchupCategory razorSharp.js
u.%: %.zip
	aws lambda update-function-code \
		--function-name "$*" \
		--zip-file $(ZIPPATH)"$*"".zip"

.PHONY: delete
delete: d.handlePortfolioPut d.shaveImage d.updateCategoriesSettings d.handlePortfolioDelete d.trimDatabases d.handleCategoriesEvent d.touchupIndex d.handleArtworkEvent d.touchupCategory razorSharp.js
d.%:
	aws lambda delete-function \
		--function-name "$*"

.PHONY: clean
clean:
	rm -f *.zip
