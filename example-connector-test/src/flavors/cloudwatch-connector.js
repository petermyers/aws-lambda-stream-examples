import { putMetrics, faulty } from 'aws-lambda-stream';

export const cloudwatchConnectorTest = (rule) => (stream) =>
  stream
    .tap(() => console.log("Cloudwatch connector test pipeline beginning."))
    .map(toMetricPutRequest(rule))
    .through(putMetrics({ putField: 'metricPutRequest' }))
    .tap(() => console.log("Cloudwatch connector test pipeline ending."));

  const toMetricPutRequest = (rule) => faulty((uow) => ({
    ...uow,
    metricPutRequest:
      rule.toMetricPutRequest
        ? /* istanbul ignore next */ rule.toMetricPutRequest(uow, rule)
        : undefined,
  }));