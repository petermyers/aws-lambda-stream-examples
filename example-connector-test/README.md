# Connector Test
A set of test operations for connector operations. Written to test AWS SDK v3 upgrade of [aws-lambda-stream](https://github.com/jgilbert01/aws-lambda-stream).

### Setup
Ensure you are authenticated with AWS.  
https://www.serverless.com/framework/docs/providers/aws/guide/credentials  

Install via Serverless:
```
npm install
npm run dp:dev
```
This will deploy all the infrastructure including the API gateway and lambda functions.

TODO - Image of infrastructure and description of lambdas.

### Connector Test
| Connector   | Pipeline That Covers It | Verified           |
|-------------|-------------------------|--------------------|
| EventBridge | TestEntityCDC           | :heavy_check_mark: |
| Cloudwatch  | CloudwatchConnectorTest | :heavy_check_mark: |
| DynamoDB    | DynamoDBConnectorTest   | :heavy_check_mark: |
| Fetch       | FetchConnectorTest      | :heavy_check_mark: |
| Firehose    | FirehoseConnectorTest   | :heavy_check_mark: |
| Kinesis     | KinesisConnectorTest    | :heavy_check_mark: |
| Lambda      | LambdaConnectorTest     | :heavy_check_mark: |
| S3          | S3ConnectorTest         |                    |
| SecretsMgr  | SecretsMgrConnectorTest | :heavy_check_mark: |
| Sns         | SnsConnectorTest        | :heavy_check_mark: |
| Sqs         | SqsConnectorTest        | :heavy_check_mark: |

To run a connector test, provide the name of the connector as an attribute in the `testEntity` you create or update. (See Execute API below). The exception is EventBridge. Every entity you post flows through the EventBridge connector in the trigger function, so there is no specific connector test in the listener for it.

```json
{
  "connector": "dynamodb"
}
```

### Execute API
Execute the created API gateway with the following proxy paths:  
| Operation | Method | Route           |
|-----------|--------|-----------------|
| Create    | POST   | /testEntity     |
| Read      | GET    | /testEntity/:id |
| Update    | PUT    | /testEntity/:id |
| Delete    | DELETE | /testEntity/:id |
  
This API sits behind a Cognito Authorizer. To call the endpoints listed above, you'll need to:
1. Create a user in the Cognito User Pool through the AWS Console.
2. Create an `auth.json` file using `auth.json.example` as the template.
3. Fill in the values in `auth.json` for `UserPoolId` and `ClientId`. The values can be found in the stack output after deploying. Also fill in the email and password for your user account.
4. Run the `get-access-token.sh` script. (this requires jq be installed).
5. Use the returned value as the `Authorization` header in your request. `Authorization: Bearer <your token>`
  
*Note that the `get-access-token.sh` script does something that you should not do outside of this example for test / educational purposes in order to facilitate ease of setup. It uses the admin cli to force the password you use to be permanent to avoid having to change the temporary password via Cognito's authentication page.*

### API Responses ###
The data model used here is comprised of a combination of entity metadata `(pk, sk, discriminator, lastModifiedBy, timestamp, ttl, etc.)` and the entity itself stored in the `entity` attribute in DynamoDB. The PK is set to the user id for the user that created the entity, and the SK to a v4 uuid representing a unique id for that entity.

API Responses are in the form:
```json
{
  "_entityMetadata_": {
    "id": "b712abaa-cf48-43ca-bba6-d419ff5265b3",
    "timestamp": 1704545801011
  },
  "entity": {
    "firstName": "Peter",
    "lastName": "Myers"
  }
}
```

### Pagination
Pagination is supposed via DynamoDB last evalulated key. You can specify pagination attributes via the query parameters `limit` and `offset`. The `GET` response to the list endpoints has the form:
```json
{
  "items": [
    {
      "_entityMetadata_": {
        "id": "49d3a69c-daa6-4615-8b85-4f8cc92d250c",
        "timestamp": 1704546204172
      },
      "entity": {
        "firstName": "Peter",
        "lastName": "5"
      }
    },
    {
      "_entityMetadata_": {
        "id": "60b48014-c4a1-4755-9b61-0a4d8a4d14b5",
        "timestamp": 1704546192855
      },
      "entity": {
        "firstName": "Peter",
        "lastName": "1"
      }
    }
  ],
  "offset": "60b48014-c4a1-4755-9b61-0a4d8a4d14b5"
}
```
You use the returned offset like a cursor, passing it back in as the offset query param to get the next page. When you've reached the final page, no offset attribute is present on the response.

### Cleanup
To cleanup created Cloudformation resources, run:
```
npm run dy:dev
```
