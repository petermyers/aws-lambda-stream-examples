import { sendToFirehose, faulty } from 'aws-lambda-stream';

export const firehoseConnectorTest = (rule) => (stream) =>
  stream
    .filter((uow) => uow.event?.entity?.connector === 'firehose')
    .tap(() => console.log("Firehose connector test pipeline beginning."))
    .through(sendToFirehose(rule))
    .tap(performValidation(rule))
    .tap(() => console.log("Firehose connector test pipeline ending."));

  const performValidation = (rule) => faulty((uow) => {
    if(uow.putResponse['$metadata'].httpStatusCode === 200) {
      console.log("Firehose connector test validation PASSED.");
      console.log("...but you should also make sure your record shows up in S3 correctly.");
    } else {
      console.log("Firehose connector test validation FAILED.");
    }
  });