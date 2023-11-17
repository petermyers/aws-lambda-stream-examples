import { updateExpression, timestampCondition } from 'aws-lambda-stream';
import {
  now, ttl, mapper
} from '../utils';

export const DISCRIMINATOR = 'test-entity';

export const MAPPER = mapper();

class Model {
  constructor(
    debug,
    connector,
    username = 'system',
    claims
  ) {
    this.debug = debug;
    this.connector = connector;
    this.username = username;
    this.claims = claims;
  }

  save(id, input) {
    const timestamp = now();

    const params = {
      Key: {
        pk: id instanceof Function ? id() : id,
        sk: DISCRIMINATOR,
      },
      ...updateExpression({
        discriminator: DISCRIMINATOR,
        lastModifiedBy: this.username || 'system',
        deleted: null,
        latched: null,
        // This ttl is 1 day, you'd probably want to bump this up.
        ttl: ttl(timestamp, 1),
        ...input,
        timestamp,
      }),
    };
    return this.connector
      .update(params)
      .tap(this.debug)
      .tapCatch(this.debug);
  }
}

export default Model;

export const toUpdateRequest = (uow) => ({
  Key: {
    pk: uow.event.testEntity.id,
    sk: DISCRIMINATOR,
  },
  ...updateExpression({
    ...uow.event.testEntity,
    discriminator: DISCRIMINATOR,
    lastModifiedBy: 'system',
    timestamp: uow.event.timestamp,
    deleted: uow.event.type === 'test-entity-deleted' ? true : null,
    latched: true,
    ttl: ttl(timestamp, 1),
  }),
  ...timestampCondition(),
});

export const toEvent = async (uow) => ({
  testEntity: await MAPPER(uow.event.raw.new),
  raw: undefined,
});