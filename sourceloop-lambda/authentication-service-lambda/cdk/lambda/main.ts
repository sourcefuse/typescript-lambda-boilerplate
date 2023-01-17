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

const getSubnetIds = () => {
  try {
    const subnetIds = process.env?.SUBNET_IDS || '';
    return JSON.parse(subnetIds);
  } catch (e) {
    console.error(e); // NOSONAR
  }
  return [];
};

const getSecurityGroup = () => {
  try {
    const securityGroup = process.env?.SECURITY_GROUPS || '';
    return JSON.parse(securityGroup);
  } catch (e) {
    console.error(e); // NOSONAR
  }
  return [];
};


// sonarignore:start
new LambdaStack(app, 'migration', {
  path: resolve(__dirname, '../../migration'),
  handler: 'lambda.handler',
  runtime: 'nodejs16.x',
  version: 'v0.0.1',
  securityGroupIds: getSecurityGroup(),
  subnetIds: getSubnetIds(),
  memorySize: 256,
  invocationData: '',
  timeout: 60,
  envVars: {
    DB_HOST: process.env.DB_HOST || '',
    DB_PORT: process.env.DB_PORT || '',
    DB_USER: process.env.DB_USER || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_DATABASE: process.env.DB_DATABASE || '',
  },
});
// sonarignore:end

// sonarignore:start
new LambdaStack(app, 'lambda', {
  path: resolve(__dirname, '../../dist'),
  handler: 'lambda.handler',
  runtime: 'nodejs16.x',
  version: 'v0.0.1',
  layerPath: resolve(__dirname, '../../layers'),
  isApiRequired: true,
  securityGroupIds: getSecurityGroup(),
  subnetIds: getSubnetIds(),
  memorySize: 256,
  timeout: 30,
  envVars: {
    DB_HOST: process.env.DB_HOST || '',
    DB_PORT: process.env.DB_PORT || '',
    DB_USER: process.env.DB_USER || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_DATABASE: process.env.DB_DATABASE || '',
    DB_SCHEMA: process.env.DB_SCHEMA || '',
    JWT_SECRET: process.env.JWT_SECRET || '',
    JWT_ISSUER: 'sourcefuce',
    PORT: '3005',
    LOG_LEVEL: 'info',
    DB_CONNECTOR: 'postgresql',
  },
});
// sonarignore:end

app.synth();
