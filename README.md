# Lambda_Barber 
### takes images from an S3 bucket, edits them, then uploads the edited photo to another S3 bucket

## Build
```bash
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 6.1.0
nvm use 6.1.0
npm init
npm install sharp
```

## Deploy
If you are updating vs. creating, make sure you have the proper aws CLI method commented in *deploy.sh*
```bash
chmod 744 deploy.sh
./deploy.sh
```
