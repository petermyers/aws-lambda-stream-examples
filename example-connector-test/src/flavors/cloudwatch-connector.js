import { putMetrics, faulty } from 'aws-lambda-stream';

export const cloudwatchConnectorTest = (rule) => (stream) =>
  stream
    .filter((uow) => uow.event?.entity?.connector === 'cloudwatch')
    .tap(() => console.log("Cloudwatch connector test pipeline beginning."))
    .map(toMetricPutRequest(rule))
    .through(putMetrics({ putField: 'metricPutRequest' }))
    .map((performValidation(rule)))
    .tap(() => console.log("Cloudwatch connector test pipeline ending."));

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cloudwatch/command/PutMetricDataCommand/
  const toMetricPutRequest = (rule) => faulty((uow) => ({
    ...uow,
    metricPutRequest: {
      Namespace: 'ConnectorTest',
      MetricData: [
        {
          MetricName: "EventCount",
          Dimensions: [
            {
              Name: "UserId",
              Value: uow.event.partitionKey,
            },
          ],
          Timestamp: new Date(uow.event.timestamp),
          Value: 1,
          Unit: "Count"
        }
      ]
    }
  }));

  const performValidation = (rule) => faulty((uow) => {
    // console.log(uow);
    if(uow.putResponse['$metadata'].httpStatusCode === 200) {
      console.log("Cloudwatch connector test validation PASSED.");
    } else {
      console.log("Cloudwatch connector test validation FAILED.");
    }
    return true;
  });