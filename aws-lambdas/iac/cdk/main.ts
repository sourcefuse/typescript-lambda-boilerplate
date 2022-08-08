import * as dotenv from 'dotenv';
import * as dotenvExt from 'dotenv-extended';
import {App} from 'cdktf';
import {LambdaStack,SqsStack} from './common';
import {resolve} from 'path';


dotenv.config();
dotenvExt.load({
  schema: '.env.example',
  errorOnMissing: true,
  includeProcessEnv: true,
});


const app = new App();

new LambdaStack(app, 'lambda', {
  path: resolve(__dirname,'../../lambda/dist/src'),
  handler: 'handlers/api-gateway.handler',
  runtime: 'nodejs16.x',
  version: 'v0.0.1',
  layerPath: resolve(__dirname,'../../lambda/dist/layers'),
  isApiRequired: true
});

new SqsStack(app, 'sqs', {
  path: resolve(__dirname,'../../lambda/dist/src'),
  handler: 'handlers/sqs.handler',
  runtime: 'nodejs16.x',
  version: 'v0.0.1',
  layerPath: resolve(__dirname,'../../lambda/dist/layers'),
  delay: 90,
  maxMessageSize: 2048,
  batchSize: 10,
  messageRetentionSeconds: 86400,
  receiveWaitTimeSeconds: 10,
  redriveMaxCount: 5
});



app.synth();
