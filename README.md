# Lambda_Barber 
### Group of AWS Lambda functions used to generate a easy-to-modify portfolio for artists.
Enables static asset optimization, HTML template rendering, and live-webpage updates with no downtime.
```
S3 		-> 	Lambda 			-> 	DynamoDB		->	Lambda			->	S3.
"config/assets" -> 	"optimize assets" 	-> 	"track metadata"	-> 	"render web pages"	->	"serve content"
```

## Build
TODO: Github -> Scripts
TODO: Cloudformation

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
