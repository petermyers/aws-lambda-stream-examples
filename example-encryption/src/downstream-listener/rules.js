import { cdc, publishToEventBridge } from 'aws-lambda-stream';
import { toEvent } from '../models/test-entity';

export default [
  {
    id: 'LoggerPipeline',
    // Logs any event that this lambda receives.
    flavor: () => (s) => s.tap((uow) => console.log(uow)),
  }
];