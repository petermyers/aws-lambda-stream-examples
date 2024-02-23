import _ from 'highland';
import { sendToSqs } from 'aws-lambda-stream/utils/sqs';
import { faulty } from 'aws-lambda-stream/utils/faults';
import { v4 } from 'uuid';

export const sqsConnectorTest = (rule) => (stream) =>
  stream
    .filter((uow) => uow.event?.entity?.connector === 'sqs')
    .tap(() => console.log("SQS connector test pipeline beginning."))
    .flatMap((uow) => _([{ ...uow, index: 0 }, { ...uow, index: 1 }, { ...uow, index: 2 }, ]))
    .map(toPublishRequest(rule))
    .through(sendToSqs(rule))
    .collect()
    // The collect makes things weird even though we filter above...this handles it.
    .filter(uows => uows.length !== 0)
    .tap(performValidation(rule))
    .tap(() => console.log("SQS connector test pipeline ending."))

const toPublishRequest = (rule) => faulty((uow) => ({
  ...uow,
  message: {
    Id: v4(),
    MessageBody: `This is sqs message ${uow.index+1}.`
  }
}));

const performValidation = (rule) => faulty((uows) => {
  // console.log('UOW: %j', uows);
  const { sendMessageBatchResponse } = uows[0];

  if(uows.length === 3 && sendMessageBatchResponse?.['$metadata']?.httpStatusCode === 200) {
    console.log("SQS connector test validation PASSED");
    console.log("...but you should go check the invoke lambda logs and verify that you see all expected messages.");
  } else {
    console.log("SQS connector test validation PASSED");
  }
});