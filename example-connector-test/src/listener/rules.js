import { cloudwatchConnectorTest } from '../flavors/cloudwatch-connector';
import { dynamoDbConnectorTest } from '../flavors/dynamodb-connector';
import { fetchConnectorTest } from '../flavors/fetch-connector';

export default [
  {
    id: 'LoggerPipeline',
    // Logs any event that this lambda receives.
    flavor: () => (s) => s.tap((uow) => console.log(uow)),
  },
  {
    id: 'CloudwatchConnectorTest',
    flavor: cloudwatchConnectorTest,
  },
  {
    id: 'DynamoDBConnectorTest',
    flavor: dynamoDbConnectorTest
  },
  {
    id: 'FetchConnectorTest',
    flavor: fetchConnectorTest
  }
];