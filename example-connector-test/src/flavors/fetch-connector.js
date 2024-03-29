import { faulty } from 'aws-lambda-stream/utils/faults';
import { fetch } from 'aws-lambda-stream/sinks/fetch';

export const fetchConnectorTest = (rule) => (stream) =>
  stream
    .filter((uow) => uow.event?.entity?.connector === 'fetch')
    .tap(() => console.log("Fetch connector test pipeline beginning."))
    .map(toFetchRequest(rule))
    .through(fetch(rule))
    .tap(performValidation(rule))
    .tap(() => console.log("Fetch connector test pipeline ending."))

const toFetchRequest = (rule) => faulty((uow) => ({
  ...uow,
  fetchRequest: {
    url: 'https://echo.free.beeceptor.com/test-thing/1'
  }
}));

const performValidation = (rule) => faulty((uow) => {
  // console.log('UOW: %j', uow);
  const fetchResponse = uow.fetchResponse;
  if(fetchResponse?.host === 'echo.free.beeceptor.com') {
    console.log("Fetch connector test validation PASSED");
  } else {
    console.log("Fetch connector test validation PASSED");
  }
});
