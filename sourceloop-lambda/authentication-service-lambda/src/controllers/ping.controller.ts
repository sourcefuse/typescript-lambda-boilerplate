import {inject} from '@loopback/core';
import {
  Request,
  RestBindings,
  get,
  response,
  ResponseObject,
} from '@loopback/rest';
import {STATUS_CODE} from '@sourceloop/core';
import {authorize} from 'loopback4-authorization';
import {
  AuthCacheSourceName,
  AuthDbSourceName,
} from '@sourceloop/authentication-service';
import {PgdbDataSource, RedisDataSource} from '../datasources';

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping DB Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingDbResponse',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */
export class PingController {
  constructor(
    @inject(RestBindings.Http.REQUEST) private req: Request,
    @inject(`datasources.${AuthDbSourceName}`)
    private readonly dataSource: PgdbDataSource,
    @inject(`datasources.${AuthCacheSourceName}`)
    private readonly redisDataSource: RedisDataSource,
  ) {}

  // Map to `GET /ping`
  @authorize({permissions: ['*']})
  @get('/ping-db', {
    responses: {
      [STATUS_CODE.OK]: PING_RESPONSE,
    },
  })
  async pingDB() {
    await this.dataSource.ping();
    await this.redisDataSource.ping();
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }
}
