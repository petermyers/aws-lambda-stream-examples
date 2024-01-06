import { debug as d } from 'debug';
import { DynamoDBConnector } from 'aws-lambda-stream';
import apiGenerator from 'lambda-api';
import { createTestEntity, deleteTestEntity, getTestEntity, listTestEntities, updateTestEntity } from './routes/test-entity';
import Model from '../models/test-entity';
import { getUserContext } from '../utils';

const api = apiGenerator();

api.use((req, res, next) => {
  res.cors();
  next();
})

api.post('/testEntity', createTestEntity);
api.get('/testEntity/:id', getTestEntity);
api.get('/testEntity', listTestEntities);
api.put('/testEntity/:id', updateTestEntity);
api.delete('/testEntity/:id', deleteTestEntity);

export const handle = async (event, context) => {
  // console.log('Event: %j', event);
  // console.log('Context: %j', context);

  const userContext = getUserContext(event.requestContext);

  const debug = d(`handler${event.path.split('/').join(':')}`);
  // You would normally grab these from the request context

  api.app({
    debug,
    models: {
      testEntity: new Model(
        debug,
        new DynamoDBConnector({
          debug,
          tableName: process.env.ENTITY_TABLE_NAME
        }),
        userContext,
      )
    }
  });

  return api.run(event, context);
};