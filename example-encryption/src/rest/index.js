import { debug as d } from 'debug';
import { DynamoDBConnector } from 'aws-lambda-stream';
import apiGenerator from 'lambda-api';
import { createTestEntity } from './routes/test-entity';
import Model from '../models/test-entity';

const api = apiGenerator();

api.use((req, res, next) => {
  res.cors();
  next();
})

api.post('/createTestEntity', createTestEntity);

export const handle = async (event, context) => {
  const debug = d(`handler${event.path.split('/').join(':')}`);

  // You would normally grab these from the request context
  const claims = {};
  const username = null;

  api.app({
    debug,
    models: {
      testEntity: new Model(
        debug,
        new DynamoDBConnector({
          debug,
          tableName: process.env.ENTITY_TABLE_NAME
        }),
        username,
        claims
      )
    }
  });

  return api.run(event, context);
};