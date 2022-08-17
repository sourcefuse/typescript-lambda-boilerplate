import * as dotenv from 'dotenv';
import * as dotenvExt from 'dotenv-extended';
import {App} from 'cdktf';
import {LambdaStack,SnsStack,SqsStack, VpcStack} from './common';
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

new SnsStack(app, 'sns', {
  path: resolve(__dirname,'../../lambda/dist/src'),
  handler: 'handlers/sns.handler',
  runtime: 'nodejs16.x',
  version: 'v0.0.1',
  layerPath: resolve(__dirname,'../../lambda/dist/layers'),
  snsTopicProtocol: "lambda",
  lambdaStatementId: "AllowExecutionFromSNS",
  lambdaAction: "lambda:InvokeFunction",
  lambdaPrincipal: "sns.amazonaws.com"
});


new VpcStack(app, 'vpc', {
  path: resolve(__dirname,'../../lambda/dist/src'),
  handler: 'handlers/vpc.handler',
  runtime: 'nodejs16.x',
  version: 'v0.0.1',
  layerPath: resolve(__dirname,'../../lambda/dist/layers'),
  vpcCidrBlock: "10.0.0.0/16",
  subnetAvailabilityZone: 'us-east-1a',
  privateSubnetCidrBlock: "10.0.1.0/24",
  publicSubnetCidrBlock: "10.0.6.0/24",
  privateDestinationCidrBlock: "0.0.0.0/0",
  publicDestinationCidrBlock: "0.0.0.0/0",
  aclIngressProtocol: "-1",
  aclIngressRuleNo: 100,
  aclIngressAction: "allow",
  aclIngressCidrBlock: "0.0.0.0/0",
  aclIngressFromPort: 0,
  aclIngressToPort: 0,
  aclEgressProtocol: "-1",
  aclEgressRuleNo: 100,
  aclEgressAction: "allow",
  aclEgressCidrBlock: "0.0.0.0/0",
  aclEgressFromPort: 0,
  aclEgressToPort: 0,
  securityGroupIngressProtocol: "-1",
  securityGroupIngressFromPort: 0,
  securityGroupIngressToPort: 0,
  securityGroupEgressProtocol: "-1",
  securityGroupEgressFromPort: 0,
  securityGroupEgressToPort: 0,
  securityGroupEgressCidrBlocks: ["0.0.0.0/0"]
});

app.synth();
