# Lambda_Barber 
### Group of AWS Lambda functions used to generate an easy-to-modify portfolio for artists.
Enables static asset optimization, HTML template rendering, and live-webpage updates with no downtime.
```
	S3 	-> 	Lambda 		-> 	DynamoDB	-> 	Lambda		-> 	S3
"config/assets" -> "optimize assets" 	-> "track metadata"	-> "render web pages"	-> "serve content"
```

## Build
```
TODO: Scripts -> Github 
TODO: Cloudformation
```

## Deploy
Currently, deployment is managed by Make
```bash
#creates deployment ready zip files from Lambda function code and dependencies
make

#tries to create Lambda function using AWS cli. Use only when zero Lambda exist.
make create
#creates Lambda function for specific module.
make c."module_name"

#updates all lambda functions with most recent code. Use only when all Lambda exist.
make update 
#updates Lambda function for specific module.
make u."module_name" 

#deletes all lambda functions. Use only when all Lambda exist.
make delete
#deletes Lambda function for specific module.
make d."module_name"

#deletes unnecessary deployment files.
make clean
```

## Roadmap

1. Modify category parser to using folder structure instead of labeled artwork files?????????
2. Add HTML page submitting POST requests to AWS API Gateway for artist/user to update settings such as ordering of artwork/categories, thumbnail art, category names.
3. Modify handler scripts to use SNS to add events to SQS to be processed by existing Lambda functions. Goals:
  * Ensure latest, most up to date pages are pushed to server last (not overwritten)
  * Efficient execution/rendering of HTML and image assets. (do minimal work required)
  * Methodology for handling missed events.
  * Decouple Lambda functions (increased concurrency, purer microservices)
  * Reduce costs??? (Lambda has to poll SQS, might not be worth it when very few events happen per year. Discuss with AWS employee at Loft)
  * See: https://aws.amazon.com/blogs/aws/queues-and-notifications-now-best-friends/
