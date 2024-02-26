import { faulty } from 'aws-lambda-stream/utils/faults';
import { 
  putDynamoDB, 
  updateDynamoDB,
  queryAllDynamoDB,
  batchGetDynamoDB,
  scanSplitDynamoDB,
  updateExpression,
} from 'aws-lambda-stream/sinks/dynamodb';
import _ from 'lodash';
import { v4 } from 'uuid';

/**
 * 1. Put
 * 2. Update
 * 3. Query
 * 4. BatchGet
 * 5. Scan
 * 6. Verify 3-5 return the same data.
 */
export const dynamoDbConnectorTest = (rule) => (stream) =>
  stream
    .filter((uow) => uow.event?.entity?.connector === 'dynamodb')
    .tap(() => console.log("DynamoDB connector test pipeline beginning."))
    // Create some test data
    .map(generatePkSkPair)
    
    // Put one piece in via put and another via update
    .map(toPutRequest(rule))
    .map(toUpdateRequest(rule))
    .through(putDynamoDB(rule))
    .through(updateDynamoDB(rule))
    
    // Craft 3 different methods of retrieval
    .map(toQueryRequest(rule))
    .map(toBatchGetRequest(rule))
    .map(toScanRequest(rule))

    // Get the data 3 days
    .through(queryAllDynamoDB(rule))
    .through(batchGetDynamoDB(rule))
    .through(scanSplitDynamoDB(rule))
    .collect()
    // The collect makes things weird even though we filter above...this handles it.
    .filter(uows => uows.length !== 0)
    .map(combineScanResponseItems(rule))

    // Validate we got back all the data that we had inserted.
    .tap(performValidation(rule))
    .tap(() => console.log("DynamoDB connector test pipeline ending."));

const generatePkSkPair = (uow) => ({
  ...uow,
  pksk: [
    { pk: 'pk-1', sk: `uuid-id-${v4()}` },
    { pk: 'pk-1', sk: `uuid-id-${v4()}` }
  ]
});

const combineScanResponseItems = (rule) => faulty((uows) => {
  const scanResponseItems = uows.reduce((acc, cv) => {
    acc.push(cv.scanResponse.Item);
    return acc;
  }, []);
  return {
    ...uows[0],
    scanResponseItems
  };
});

const performValidation = (rule) => faulty((uow) => {
  // Verify that both the result of putRequest and result of updateRequest
  // Are present in all 3 of the query, batchGet, and scanSplit.
  // console.log('UOW: %j', uow);
  const expectedPkSks = uow.pksk;
  const queryResponseItems = uow.queryResponse.map((el) => ({ pk: el.pk, sk: el.sk }));
  const getResponseItems = uow.batchGetResponse.Responses[process.env.ENTITY_TABLE_NAME].map((el) => ({ pk: el.pk, sk: el.sk }));
  const scanResponseItems = uow.scanResponseItems.map((el) => ({ pk: el.pk, sk: el.sk }));

  const hasAllInQueryResponse = expectedPkSks
    .reduce((acc, cv) => acc && _.some(queryResponseItems, cv), true);
  const hasAllInGetResponse = expectedPkSks
    .reduce((acc, cv) => acc && _.some(getResponseItems, cv), true);
  const hasAllInScanResponse = expectedPkSks
    .reduce((acc, cv) => acc && _.some(scanResponseItems, cv), true);
  
  if(!hasAllInQueryResponse || !hasAllInGetResponse || !hasAllInScanResponse) {
    console.log("DynamoDB connector test validation FAILED");
  } else {
    console.log("DynamoDB connector test validation PASSED");
  }
});

const buildUpdateRequest = (uow) => ({
  Key: {
    pk: uow.pksk[0].pk,
    sk: uow.pksk[0].sk,
  },
  ...updateExpression({
    discriminator: 'uuid-test',
    entity: uow.event.entity
  })
});

const buildPutRequest = (uow) => ({
  Item: {
    pk: uow.pksk[1].pk,
    sk: uow.pksk[1].sk,
    discriminator: 'uuid-test',
    entity: uow.event.entity
  }
});

const buildBatchGetRequest = (uow) => ({
  RequestItems: {
    [process.env.ENTITY_TABLE_NAME]: {
      ConsistentRead: true,
      Keys: uow.pksk
    }
  }
});

const buildQueryRequest = (uow) => ({
  ConsistentRead: true,
  KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
  ExpressionAttributeValues: {
    ':pk': 'pk-1',
    ':skPrefix': 'uuid-id',
  }
});

const buildScanRequest = (uow) => ({
  ConsistentRead: true,
  FilterExpression: "begins_with(sk, :skPrefix)",
  ExpressionAttributeValues: {
    ':skPrefix': 'uuid-id',
  }
});

const toUpdateRequest = (rule) => faulty((uow) => ({
  ...uow,
  updateRequest: buildUpdateRequest(uow)
}));

const toPutRequest = (rule) => faulty((uow) => ({
  ...uow,
  putRequest: buildPutRequest(uow)
}));

const toBatchGetRequest = (rule) => faulty((uow) => ({
  ...uow,
  batchGetRequest: buildBatchGetRequest(uow)
}));

const toQueryRequest = (rule) => faulty((uow) => ({
  ...uow,
  queryRequest: buildQueryRequest(uow),
}));

const toScanRequest = (rule) => faulty((uow) => ({
  ...uow,
  scanRequest: buildScanRequest(uow)
}));