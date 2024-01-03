# Event Hub
### Setup
Ensure you are authenticated with AWS.  
https://www.serverless.com/framework/docs/providers/aws/guide/credentials  

Install via Serverless:
```
npm install
npm run dp:dev
```
This will deploy a simple event bus to use as the communication backbone between service components.

### Cleanup
To cleanup created Cloudformation resources, run:
```
npm run dy:dev
```
