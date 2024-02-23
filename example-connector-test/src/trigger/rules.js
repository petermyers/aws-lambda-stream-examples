import { cdc } from 'aws-lambda-stream/flavors/cdc';
import { publishToEventBridge } from 'aws-lambda-stream/utils/eventbridge'
import { toEvent } from '../models/test-entity';

export default [
  {
    id: 'TestEntityCDC',
    flavor: cdc,
    // eventType: /test-entity-(created|updated|deleted)/,
    eventType: /test-entity-(created|updated)/,
    toEvent,
    publish: publishToEventBridge
  }
];