import { App } from 'cdktf';
import * as dotenv from 'dotenv';
import * as dotenvExt from 'dotenv-extended';
import { resolve } from 'path';
import { LambdaStack } from './common';

dotenv.config();
dotenvExt.load({
  schema: '.env.example',
  errorOnMissing: true,
  includeProcessEnv: true,
});

const app = new App();

// NOSONAR
new LambdaStack(app, 'migration', {
  path: resolve(__dirname, '../../migration'),
  handler: 'lambda.handler',
  runtime: 'nodejs16.x',
  version: 'v0.0.1',
  securityGroupIds: ['sg-0297fbdb05fe726b4'],
  subnetIds: ['subnet-01c22b0adf9cdd8df', 'subnet-0b32fea3b2e13a6ba'],
  memorySize: 256,
  isMigration: true,
  timeout: 60,
  envVars: {
    DB_HOST:
      'arc2-dev-aurora-examples-1.c1ighjve6ggz.us-east-1.rds.amazonaws.com',
    DB_PORT: '5432',
    DB_USER: 'example_db_admin',
    DB_PASSWORD: 'password',
    DB_DATABASE: 'example',
    DB_SCHEMA: 'public',
  },
});

new LambdaStack(app, 'lambda', {
  path: resolve(__dirname, '../../dist'),
  handler: 'lambda.handler',
  runtime: 'nodejs16.x',
  version: 'v0.0.1',
  layerPath: resolve(__dirname, '../../layers'),
  isApiRequired: true,
  securityGroupIds: ['sg-0297fbdb05fe726b4'],
  subnetIds: ['subnet-01c22b0adf9cdd8df', 'subnet-0b32fea3b2e13a6ba'],
  memorySize: 256,
  timeout: 30,
  envVars: {
    DB_HOST:
      'arc2-dev-aurora-examples-1.c1ighjve6ggz.us-east-1.rds.amazonaws.com',
    DB_PORT: '5432',
    DB_USER: 'example_db_admin',
    DB_PASSWORD: 'password',
    DB_DATABASE: 'example',
    DB_SCHEMA: 'main',
    JWT_SECRET: 'secret',
    JWT_ISSUER: 'sourcefuce',
    PORT: '3005',
    LOG_LEVEL: 'info',
    DB_CONNECTOR: 'postgresql',
  },
});

app.synth();
