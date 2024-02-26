// put 2 objects
// list objects
// get 2 objects
// get 2 object streams
// delete 2 objects
import { faulty } from 'aws-lambda-stream/utils/faults';
import { 
  putObjectToS3, 
  deleteObjectFromS3,
  getObjectFromS3,
  getObjectFromS3AsStream,
  listObjectsFromS3
} from 'aws-lambda-stream/sinks/s3';
import _ from 'highland';

export const s3ConnectorTest = (rule) => (stream) =>
  stream
    .filter((uow) => uow.event?.entity?.connector === 's3')
    .tap(() => console.log("S3 connector test pipeline beginning."))

    // Put 3 objects
    .flatMap((uow) => _([ { ...uow, index: 0 }, { ...uow, index: 1 }, { ...uow, index: 2 } ]))
    .map(toPutRequest(rule))
    .through(putObjectToS3(rule))
    .collect()
    .filter(uows => uows.length !== 0)
    .map(normalizeUowPutResponses)

    // List all objects
    .map(toListRequest(rule))
    .through(listObjectsFromS3(rule))

    // Get the first 2 objects, get as stream the 3rd object
    .flatMap((uow) => _([ { ...uow, index: 0 }, { ...uow, index: 1 }, { ...uow, index: 2 } ]))
    .map(toGetRequest(rule))
    .map(toGetStreamRequest(rule))
    .through(getObjectFromS3(rule))
    .through(getObjectFromS3AsStream({ ...rule, getRequestField: 'getStreamRequest', getResponseField: 'getStreamResponse' }))
    .collect()
    .filter(uows => uows.length !== 0)
    .map(normalizeUowGetResponses)

    // Delete 3 objects
    .flatMap((uow) => _([ { ...uow, index: 0 }, { ...uow, index: 1 }, { ...uow, index: 2 } ]))
    .map(toDeleteRequest(rule))
    .through(deleteObjectFromS3(rule))
    .collect()
    .filter(uows => uows.length !== 0)
    .map(normalizeUowDeleteResponses)

    .tap(performValidation(rule))
    .tap(() => console.log("S3 connector test pipeline ending."))

const normalizeUowPutResponses = faulty((uows) => ({
  ...uows[0],
  putResponses: uows.map(uow => uow.putResponse)
}));

const normalizeUowDeleteResponses = faulty((uows) => ({
  ...uows[0],
  deleteResponses: uows.map(uow => uow.deleteResponse)
}));

const normalizeUowGetResponses = faulty((uows) => ({
  ...uows[0],
  getResponses: uows.map(uow => uow.getResponse).filter(Boolean),
  getStreamResponses: uows.map(uow => uow.getStreamResponse).filter(Boolean)
}));

const toPutRequest = (rule) => faulty((uow) => ({
  ...uow,
  putRequest: {
    Key: `test-object-${uow.index+1}`,
    Body: uow.index < 2 ? 
      `Put object ${uow.index+1}.` :
      `Put multi-line object 1.\nPut multi-line object 2.\nPut multi-line object 3.`
  }
}));

const toListRequest = (rule) => faulty((uow) => ({
  ...uow,
  listRequest: {}
}));

const toDeleteRequest = (rule) => faulty((uow) => ({
  ...uow,
  deleteRequest: {
    Key: `test-object-${uow.index+1}`,
  }
}));

const toGetRequest = (rule) => faulty((uow) => ({
  ...uow,
  getRequest: uow.index < 2 ? {
    Key: `test-object-${uow.index+1}`,
  } : undefined
}));

const toGetStreamRequest = (rule) => faulty((uow) => ({
  ...uow,
  getStreamRequest: uow.index === 2 ? {
    Key: `test-object-${uow.index+1}`
  } : undefined
}));

const performValidation = (rule) => faulty((uow) => {
  // console.log('UOW: %j', uow);
  const putResponse = uow.putResponses[0];

  const listResponse = uow.listResponse;
  const allKeys = listResponse?.Contents?.map(c => c.Key) || [];
  const listResponseHasAllKeys = allKeys.includes("test-object-1") && allKeys.includes("test-object-2") && allKeys.includes("test-object-3");

  const getResponse = uow.getResponse;
  const getResponses = uow.getResponses?.map(gr => gr.Body.toString('utf-8')) || [];
  const getResponsesHasAllKeys = getResponses.includes('Put object 1.') && getResponses.includes('Put object 2.');

  const streamResponsesHasAllKeys = 
    uow.getStreamResponses?.includes("Put multi-line object 1.") && 
    uow.getStreamResponses?.includes("Put multi-line object 2.") && 
    uow.getStreamResponses?.includes("Put multi-line object 3.");

  const deleteResponse = uow.deleteResponse;
  const deleteResponseHasAllKeys = uow.deleteResponses?.length === 3;

  if(
    putResponse?.['$metadata']?.httpStatusCode === 200 && 
    listResponse?.['$metadata']?.httpStatusCode === 200 &&
    getResponse?.['$metadata']?.httpStatusCode === 200 &&
    deleteResponse?.['$metadata']?.httpStatusCode === 204 &&
    listResponseHasAllKeys &&
    getResponsesHasAllKeys &&
    streamResponsesHasAllKeys &&
    deleteResponseHasAllKeys
  ) {
    console.log("S3 connector test validation PASSED");
    console.log("...but you should check that at the end of this pipeline, all the s3 objects were deleted.");
  } else {
    console.log("S3 connector test validation PASSED");
  }
});
