# AWS Lambda Stream Examples
Examples of event driven architecture on AWS leveraging the [aws-lambda-stream](https://github.com/jgilbert01/aws-lambda-stream) library.  
  
Meant to act as standalone examples, not as components. As such, you'll see certain common components like the event bus duplicated across the examples.

* These examples depend on the aws-lambda-stream AWS SDK v3 upgrade. This work has not yet been completed. *
  
### Examples
**[Event Hub](/example-event-hub/)** 
- Common event bus

**[Encryption Envelope](/example-encryption/)**
- Common event bus
- DDB table
- Rest endpoint
- Trigger function
- SQS channel
- Downstream listener function

**[Example BFF](/example-bff/)**
- Common event bus
- DDB table
- Cognito user pool
- Rest endpoint
- Cognito api gateway authorizer
- Trigger function

**[Example Connector Test](/example-connector-test/)**  
*Test project. Custom flavors for testing all the connector functionality in [aws-lambda-stream](https://github.com/jgilbert01/aws-lambda-stream). No other functional purpose.*
