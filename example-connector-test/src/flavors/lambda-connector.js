import { invokeLambda, faulty } from 'aws-lambda-stream';

export const lambdaConnectorTest = (rule) => (stream) =>
  stream
    .filter((uow) => uow.event?.entity?.connector === 'lambda')
    .tap(() => console.log("Lambda connector test pipeline beginning."))
    .map(toInvokeRequest(rule))
    .through(invokeLambda(rule))
    .map((performValidation(rule)))
    .tap(() => console.log("Lambda connector test pipeline ending."));

  const toInvokeRequest = (rule) => faulty((uow) => ({
    ...uow,
    invokeRequest: {
      FunctionName: process.env.INVOKE_LAMBDA_NAME,
      Payload: JSON.stringify({ ping: true }),
    }
  }));

  const performValidation = (rule) => faulty((uow) => {
    // console.log(uow);
    const decodedPayload = JSON.parse(Buffer.from(uow.invokeResponse.Payload));
    // console.log(decodedPayload);
    if(decodedPayload.pong && uow.invokeResponse['$metadata'].httpStatusCode === 200) {
      console.log("Lambda connector test validation PASSED.");
    } else {
      console.log("Lambda connector test validation FAILED.");
    }
    return true;
  });