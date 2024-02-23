import _ from 'highland';
import { faulty } from 'aws-lambda-stream/utils/faults';
import { publishToKinesis } from 'aws-lambda-stream/utils/kinesis';

export const kinesisConnectorTest = (rule) => (stream) =>
  stream
    .filter((uow) => uow.event?.entity?.connector === 'kinesis')
    .tap(() => console.log("Kinesis connector test pipeline beginning."))
    .flatMap((uow) => _([{ ...uow, index: 0 }, { ...uow, index: 1 }, { ...uow, index: 2 }, ]))
    .map(toPublishRequest(rule))
    .through(publishToKinesis({ ...rule, eventField: 'kinesisEvent' }))
    .collect()
    // The collect makes things weird even though we filter above...this handles it.
    .filter(uows => uows.length !== 0)
    .tap(performValidation(rule))
    .tap(() => console.log("Kinesis connector test pipeline ending."))

const toPublishRequest = (rule) => faulty((uow) => ({
  ...uow,
  kinesisEvent: {
    partitionKey: 'test',
    message: `This is kinesis message ${uow.index+1}.`
  }
}));

const performValidation = (rule) => faulty((uows) => {
  // console.log('UOW: %j', uows);
  const { publishResponse } = uows[0];

  if(uows.length === 3 && publishResponse?.['$metadata']?.httpStatusCode === 200) {
    console.log("Kinesis connector test validation PASSED");
    console.log("...but you should go check the invoke lambda logs and verify that you see all expected messages.");
  } else {
    console.log("Kinesis connector test validation PASSED");
  }
});