import _ from 'highland';
import { faulty, rejectWithFault } from 'aws-lambda-stream/utils/faults';
import { debug as d } from 'aws-lambda-stream/utils/print';
import { publishToSns } from 'aws-lambda-stream/utils/sns';
import { ratelimit } from 'aws-lambda-stream/utils/ratelimit';
import SnsConnector from 'aws-lambda-stream/connectors/sns';
import { v4 } from 'uuid';

export const snsConnectorTest = (rule) => (stream) =>
  stream
    .filter((uow) => uow.event?.entity?.connector === 'sns')
    .tap(() => console.log("SNS connector test pipeline beginning."))
    .map(toPublishRequest(rule))
    .map(toPublishBatchRequest(rule))
    .through(publishToSns(rule))
    .through(publishBatchToSns(rule))
    .tap(performValidation(rule))
    .tap(() => console.log("SNS connector test pipeline ending."))

const toPublishRequest = (rule) => faulty((uow) => ({
  ...uow,
  message: {
    Message: 'This is sns message 1.'
  }
}));

const toPublishBatchRequest = (rule) => faulty((uow) => ({
  ...uow,
  batchMessage: {
    PublishBatchRequestEntries: [
      {
        Id: v4(),
        Message: 'This is sns message 2.'
      },
      {
        Id: v4(),
        Message: 'This is sns message 3.'
      },
      {
        Id: v4(),
        Message: 'This is sns message 4.'
      }
    ]
  }
}));

const performValidation = (rule) => faulty((uow) => {
  // console.log('UOW: %j', uow);
  const { publishResponse, publishBatchResponse } = uow;

  if(publishResponse?.['$metadata'].httpStatusCode === 200 && publishBatchResponse?.['$metadata'].httpStatusCode === 200) {
    console.log("SNS connector test validation PASSED");
    console.log("...but you should go check the invoke lambda logs and verify that you see all expected messages.");
  } else {
    console.log("SNS connector test validation PASSED");
  }
});

export const publishBatchToSns = ({
  debug = d('sns'),
  topicArn = process.env.TOPIC_ARN,
  messageField = 'batchMessage',
  parallel = Number(process.env.SNS_PARALLEL) || Number(process.env.PARALLEL) || 8,
  ...opt
} = {}) => {
  const connector = new SnsConnector({ debug, topicArn });

  const publish = (uow) => {
    const p = connector.publishBatch(uow.batchMessage)
      .then((publishBatchResponse) => ({ ...uow, publishBatchResponse }))
      .catch(rejectWithFault(uow));

    return _(p); // wrap promise in a stream
  };

  return (s) => s
    .through(ratelimit(opt))
    .map(publish)
    .parallel(parallel);
};