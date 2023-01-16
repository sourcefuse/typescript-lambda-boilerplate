import {inject} from '@loopback/core';
import {get, response, ResponseObject} from '@loopback/rest';
import {authorize} from 'loopback4-authorization';
// import {PostgresDataSource} from '../datasources';
import {AuthDbSourceName} from '@sourceloop/authentication-service';
import {PgdbDataSource} from '../datasources';

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
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
    @inject(`datasources.${AuthDbSourceName}`)
    private readonly postgresDataSource: PgdbDataSource, // @inject('datasources.postgres') // private readonly postgresDataSource: PostgresDataSource,
  ) {}

  // Map to `GET /ping`
  @authorize({permissions: ['*']})
  @get('/health')
  @response(200, PING_RESPONSE)
  async ping(): Promise<object> {
    try {
      await this.postgresDataSource.ping();
      return {
        greeting: 'Hello from LoopBack',
        date: new Date(),
      };
    } catch (e) {
      console.log(e);
    }
    return {};
  }

  // Map to `GET /ping`
  @authorize({permissions: ['*']})
  @get('/ping')
  @response(200, PING_RESPONSE)
  async pings(): Promise<object> {
    try {
      return {
        greeting: 'from LoopBack',
        date: new Date(),
      };
    } catch (e) {
      console.log(e);
    }
    return {};
  }
}
