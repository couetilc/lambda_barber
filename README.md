# Lambda_Barber 
### takes images from an S3 bucket, edits them, then uploads the edited photo to another S3 bucket

## Build
```bash
git clone https://github.com/couetilc/lambda_barber.git
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 8.1.0
nvm use 8.1.0
npm init
npm install sharp
```

## Deploy
Modify script parameters as needed.
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
```
