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
  "testKey": "this is a test value",
  "testOtherKey": "this is another test value"
}
```

Take a look at the logs for the downstream listener lambda. Observe that the incoming value for the `testKey` attribute is encrypted on the event and then is decrypted before logging it out.

Note the unit of work logged out. You can see the even both before and after decryption.
```
{
  pipeline: 'LoggerPipeline',
  ...
  event: {
    id: '2cc3240a193d7f0cf9325fd869dc99cc',
    type: 'test-entity-created',
    partitionKey: '5a714c7e-3413-4237-805a-a6ac711dd1ea',
    timestamp: 1700240064000,
    tags: {
      account: 'undefined',
      region: 'us-east-1',
      stage: 'dev',
      source: 'example-encryption-service',
      functionname: 'example-encryption-service-dev-trigger',
      pipeline: 'TestEntityCDC'
    },
    testEntity: {
      testOtherKey: 'this is another test value',
      lastModifiedBy: 'system',
      testKey: 'this is a test value',
      timestamp: 1700240064523,
      id: '5a714c7e-3413-4237-805a-a6ac711dd1ea'
    }
  },
  ...
  undecryptedEvent: {
    id: '2cc3240a193d7f0cf9325fd869dc99cc',
    type: 'test-entity-created',
    partitionKey: '5a714c7e-3413-4237-805a-a6ac711dd1ea',
    timestamp: 1700240064000,
    tags: {
      account: 'undefined',
      region: 'us-east-1',
      stage: 'dev',
      source: 'example-encryption-service',
      functionname: 'example-encryption-service-dev-trigger',
      pipeline: 'TestEntityCDC'
    },
    testEntity: {
      testOtherKey: 'this is another test value',
      lastModifiedBy: 'system',
      testKey: 'U2FsdGVkX1+yOU0nYCzI4sV5EWLKpk4YMjCfaxpMamDuBLYjPyDyHTQpaSEyq75m',
      timestamp: 1700240064523,
      id: '5a714c7e-3413-4237-805a-a6ac711dd1ea'
    },
    eem: {
      dataKeys: [Object],
      masterKeyAlias: 'alias/master',
      fields: [Array]
    }
  },
  ...
}
```

### Cleanup
To cleanup created Cloudformation resources, run:
```
npm run dy:dev
```
