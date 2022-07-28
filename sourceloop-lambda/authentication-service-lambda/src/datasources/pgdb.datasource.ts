import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {AnyObject, juggler} from '@loopback/repository';
import {AuthDbSourceName} from '@sourceloop/authentication-service';

const DEFAULT_MAX_CONNECTIONS = 25;
const DEFAULT_DB_IDLE_TIMEOUT_MILLIS = 60000;
const DEFAULT_DB_CONNECTION_TIMEOUT_MILLIS = 2000;

const config = {
  name: 'pgdb',
  connector: process.env.DB_CONNECTOR,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  schema: process.env.DB_SCHEMA,
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class PgdbDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = AuthDbSourceName;
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.pgdb', {optional: true})
    dsConfig: object = config,
  ) {
    const configEnv: AnyObject = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      schema: process.env.DB_SCHEMA,
    };

    if (!!+(process.env.ENABLE_DB_CONNECTION_POOLING ?? 0)) {
      configEnv.max = +(
        process.env.DB_MAX_CONNECTIONS ?? DEFAULT_MAX_CONNECTIONS
      );
      configEnv.idleTimeoutMillis = +(
        process.env.DB_IDLE_TIMEOUT_MILLIS ?? DEFAULT_DB_IDLE_TIMEOUT_MILLIS
      );
      configEnv.connectionTimeoutMillis = +(
        process.env.DB_CONNECTION_TIMEOUT_MILLIS ??
        DEFAULT_DB_CONNECTION_TIMEOUT_MILLIS
      );
    }

    Object.assign(dsConfig, configEnv);
    super(dsConfig);
  }
}
