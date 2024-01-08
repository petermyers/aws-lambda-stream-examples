
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cloudwatch/command/PutMetricDataCommand/
export const toMetricPutRequest = (uow) => {
  const { event } = uow;
  const { partitionKey: userId, timestamp } = event;
  return {
    Namespace: 'ConnectorTest',
    MetricData: [
      {
        MetricName: "EventCount",
        Dimensions: [
          {
            Name: "UserId",
            Value: userId,
          },
        ],
        Timestamp: new Date(timestamp),
        Value: 1,
        Unit: "Count"
      }
    ]
  };
};