import { updateExpression } from 'aws-lambda-stream/sinks/dynamodb';
import { defaultDebugLogger } from 'aws-lambda-stream/utils/log';
import {
  now, ttl, mapper
} from '../utils';
import { v4 } from 'uuid';

export const DISCRIMINATOR = 'test-entity';

export const MAPPER = mapper();

class Model {
  constructor(
    debug,
    connector,
    userContext
  ) {
    this.debug = defaultDebugLogger(debug);
    this.connector = connector;
    this.userContext = userContext;
  }

  create(input) {
    const timestamp = now();
    const { username } = this.userContext;

    const params = {
      Key: {
        pk: username,
        sk: v4(),
      },
      ...updateExpression({
        timestamp,
        discriminator: DISCRIMINATOR,
        lastModifiedBy: username,
        entity: {
          ...input
        }
      })
    };

    return this.connector.update(params)
      .tap((p) => console.log(p))
      .tap(this.debug)
      .tapCatch(this.debug)
      .then((data) => MAPPER(data.Attributes));
  }

  update(id, input) {
    const timestamp = now();
    const { username } = this.userContext;

    const updateExpressionParams = updateExpression({
      timestamp,
      lastModifiedBy: this.username,
      entity: {
        ...input
      }
    });
    updateExpressionParams.ExpressionAttributeNames['#discriminator'] = 'discriminator';
    updateExpressionParams.ExpressionAttributeValues[':discriminator'] = DISCRIMINATOR;
    const params = {
      Key: {
        pk: username,
        sk: id,
      },
      ConditionExpression: "#discriminator = :discriminator",
      ...updateExpressionParams,
    };

    return this.connector.update(params)
      .tap((p) => console.log(p))
      .tap(this.debug)
      .tapCatch(this.debug)
      .then((data) => MAPPER(data.Attributes));
  }

  get(id) {
    const { username } = this.userContext;

    const params = {
      KeyConditionExpression: "#pk = :pk AND #sk = :sk",
      FilterExpression: "#discriminator = :discriminator",
      ExpressionAttributeNames: {
        '#pk': 'pk',
        '#sk': 'sk',
        '#discriminator': 'discriminator'
      },
      ExpressionAttributeValues: { 
        ':pk': username,
        ':sk': id,
        ':discriminator': DISCRIMINATOR,
      },
      ConsistentRead: true,
    };

    return this.connector
      .query(params)
      .tap((p) => console.log(p))
      .tap(this.debug)
      .tapCatch(this.debug)
      .then((data) => MAPPER(data[0]));
  }

  delete(id) {
    const timestamp = now();
    const { username } = this.userContext;

    const updateExpressionParams = updateExpression({
      timestamp,
      lastModifiedBy: this.username,
      discriminator: `deleted|${DISCRIMINATOR}`,
      ttl: ttl(timestamp, 1)
    });
    updateExpressionParams.ExpressionAttributeNames['#discriminator'] = 'discriminator';
    updateExpressionParams.ExpressionAttributeValues[':_old_discriminator_'] = DISCRIMINATOR;
    const params = {
      Key: {
        pk: username,
        sk: id,
      },
      ConditionExpression: "#discriminator = :_old_discriminator_",
      ...updateExpressionParams,
    };

    return this.connector.update(params)
      .tap((p) => console.log(p))
      .tap(this.debug)
      .tapCatch(this.debug)
      .then((data) => MAPPER(data.Attributes));
  }

  list(limit, offset) {
    const { username } = this.userContext;

    const lastEvaluatedKey = offset ? {
      pk: username,
      sk: offset,
      discriminator: DISCRIMINATOR,
    } : null;
    const pageSize = parseInt(limit) || 10;

    const params = {
      IndexName: 'DiscriminatedPKIndex',
      KeyConditionExpression: "#discriminator = :discriminator AND #pk = :pk",
      ExpressionAttributeNames: {
        "#discriminator": 'discriminator',
        '#pk': 'pk',
      },
      ExpressionAttributeValues: {
        ':pk': username,
        ':discriminator': DISCRIMINATOR,
      },
      Limit: pageSize
    };
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }

    return this.connector.queryPage(params)
      .tap((p) => console.log(p))
      .tap(this.debug)
      .tapCatch(this.debug)
      .then((data) => {
        const returnVal = {
          items: data.Items.map(MAPPER)
        };
        if (data.LastEvaluatedKey) {
          returnVal.offset = data.LastEvaluatedKey.sk
        };

        return returnVal;
      });
  }
}

export default Model;

// export const toUpdateRequest = (uow) => ({
//   Key: {
//     pk: uow.event.testEntity.id,
//     sk: DISCRIMINATOR,
//   },
//   ...updateExpression({
//     ...uow.event.testEntity,
//     discriminator: DISCRIMINATOR,
//     lastModifiedBy: 'system',
//     timestamp: uow.event.timestamp,
//     deleted: uow.event.type === 'test-entity-deleted' ? true : null,
//     latched: true,
//     ttl: ttl(timestamp, 1),
//   }),
//   ...timestampCondition(),
// });

export const toEvent = async (uow) => ({
  ...(await MAPPER(uow.event.raw.new)),
  raw: undefined,
});