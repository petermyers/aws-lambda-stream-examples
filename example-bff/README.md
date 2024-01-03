# Backend for Frontend (BFF)
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

### Execute API
Execute the created API gateway with the following proxy paths:  
| Operation | Method | Route           |
|-----------|--------|-----------------|
| Create    | POST   | /testEntity     |
| Read      | GET    | /testEntity/:id |
| Update    | PUT    | /testEntity/:id |
| Delete    | DELETE | /testEntity/:id |

### Cleanup
To cleanup created Cloudformation resources, run:
```
npm run dy:dev
```
