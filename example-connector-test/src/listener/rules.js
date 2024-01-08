import { cloudwatchConnectorTest } from '../flavors/cloudwatch-connector';
import { toMetricPutRequest } from '../models/connector-test';

export default [
  {
    id: 'LoggerPipeline',
    // Logs any event that this lambda receives.
    flavor: () => (s) => s.tap((uow) => console.log(uow)),
  },
  {
    id: 'CloudwatchConnectorTest',
    flavor: cloudwatchConnectorTest,
    toMetricPutRequest
  }
];