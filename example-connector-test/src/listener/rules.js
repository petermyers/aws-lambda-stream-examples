import { cloudwatchConnectorTest } from '../flavors/cloudwatch-connector';
import { dynamoDbConnectorTest } from '../flavors/dynamodb-connector';
import { fetchConnectorTest } from '../flavors/fetch-connector';
import { firehoseConnectorTest } from '../flavors/firehose-connector';
import { lambdaConnectorTest } from '../flavors/lambda-connector';
import { secretsConnectorTest } from '../flavors/secrets-connector';

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
  },
  {
    id: 'FirehoseConnectorTest',
    flavor: firehoseConnectorTest
  },
  {
    id: "LambdaConnectorTest",
    flavor: lambdaConnectorTest
  },
  {
    id: "SecretsMgrConnectorTest",
    flavor: secretsConnectorTest,
  }
];