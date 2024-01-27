USERNAME=$(cat auth.json | jq -r .AuthParameters.USERNAME)
PASSWORD=$(cat auth.json | jq -r .AuthParameters.PASSWORD)
USERPOOL_ID=$(cat auth.json | jq -r .UserPoolId)
aws cognito-idp admin-create-user --region us-east-1 --user-pool-id $USERPOOL_ID --username $USERNAME --message-action SUPPRESS
aws cognito-idp admin-set-user-password --region us-east-1 --user-pool-id $USERPOOL_ID --username $USERNAME --password $PASSWORD --permanent
aws cognito-idp admin-initiate-auth --region us-east-1 --cli-input-json file://auth.json | jq -r .AuthenticationResult.IdToken
