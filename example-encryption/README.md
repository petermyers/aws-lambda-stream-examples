# Event Field Encryption
### Setup
Ensure you are authenticated with AWS.  
https://www.serverless.com/framework/docs/providers/aws/guide/credentials  

Install via Serverless:
```
npm install
npm run dp:dev
```
This will deploy all the infrastructure as well as the 3 lambda functions.

TODO - Image of infrastructure and description of lambdas.

### Observe Encryption
Execute the created API gateway at proxy path `/createTestEntity` using json payload:
```
{
  "testKey": "testValue",
  "testKey2": "testValue2
}
```

Observe the logs at the downstream listener lambda. Observe that the incoming value for the `testKey` attribute is encrypted on the event and then is decrypted before logging it out.

### Cleanup
To cleanup created Cloudformation resources, run:
```
npm run dy:dev
```
