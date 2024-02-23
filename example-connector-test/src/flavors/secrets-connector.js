import _ from 'highland';
import { faulty, rejectWithFault } from 'aws-lambda-stream/utils/faults';
import { debug as d } from 'aws-lambda-stream/utils/print';
import SecretsMgrConnector from 'aws-lambda-stream/connectors/secretsmgr';

export const secretsConnectorTest = (rule) => (stream) =>
  stream
    .filter((uow) => uow.event?.entity?.connector === 'secrets')
    .tap(() => console.log("SecretsMgr connector test pipeline beginning."))
    .through(getSecrets({ secretId: process.env.NOT_SO_SECRET_NAME }))
    .tap(performValidation(rule))
    .tap(() => console.log("SecretsMgr connector test pipeline ending."))

const performValidation = (rule) => faulty((uow) => {
  const secretResponse = uow.secretResponse;
  if(secretResponse.notSecret === 'definitely not secret') {
    console.log("SecretsMgr connector test validation PASSED");
  } else {
    console.log("SecretsMgr connector test validation FAILED");
  }
});

// Yes...typically this probably wouldn't be used in a pipeline, just once up front.
// Doing it this way makes for nice testability though :)
const getSecrets = ({
  debug = d('sm'),
  secretId,
  parallel = Number(process.env.SM_PARALLEL) || Number(process.env.PARALLEL) || 8,
} = {}) => {
  const connector = new SecretsMgrConnector({
    debug, secretId
  });

  const getSecrets = (uow) => {
    const p = connector.get()
      .then((secretResponse) => ({ ...uow, secretResponse }))
      .catch(rejectWithFault);

    return _(p);
  }

  return (s) => s
    .map(getSecrets)
    .parallel(parallel);
};