import * as dotenv from 'dotenv';
import * as dotenvExt from 'dotenv-extended';
import {App} from 'cdktf';
import {LambdaStack,SnsStack,SqsStack} from './common';
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
  isApiRequired: true,
  securityGroupIds: ["sg-07f481ec2ced54878"],
  subnetIds: ["subnet-01c22b0adf9cdd8df", "subnet-0b32fea3b2e13a6ba"]
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
  redriveMaxCount: 5,
  securityGroupIds: ["sg-07f481ec2ced54878"],
  subnetIds: ["subnet-01c22b0adf9cdd8df", "subnet-0b32fea3b2e13a6ba"]
});

new SnsStack(app, 'sns', {
  path: resolve(__dirname,'../../lambda/dist/src'),
  handler: 'handlers/sns.handler',
  runtime: 'nodejs16.x',
  version: 'v0.0.1',
  layerPath: resolve(__dirname,'../../lambda/dist/layers'),
  snsTopicProtocol: "lambda",
  lambdaStatementId: "AllowExecutionFromSNS",
  lambdaAction: "lambda:InvokeFunction",
  lambdaPrincipal: "sns.amazonaws.com",
  securityGroupIds: ["sg-07f481ec2ced54878"],
  subnetIds: ["subnet-01c22b0adf9cdd8df", "subnet-0b32fea3b2e13a6ba"],
  kmsMasterKeyId: 'alias/aws/sns'
});

app.synth();
