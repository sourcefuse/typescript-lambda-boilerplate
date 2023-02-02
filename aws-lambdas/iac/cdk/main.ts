import { App } from "cdktf";
import * as dotenv from "dotenv";
import * as dotenvExt from "dotenv-extended";
import { resolve } from "path";
import { LambdaStack, SnsStack, SqsStack } from "./common";
import { CronModule } from "./common/stacks/cron.stack";
import { ElasticacheStack } from "./common/stacks/elasticache";

dotenv.config();
dotenvExt.load({
  schema: ".env.example",
  errorOnMissing: true,
  includeProcessEnv: true,
});

const app = new App();
const codePath = resolve(__dirname, "../../lambda/dist/src");
const nodeRuntime = "nodejs16.x";
const layerPath = resolve(__dirname, "../../lambda/dist/layers");

const getSubnetIds = () => {
  try {
    const subnetIds = process.env?.SUBNET_IDS || "";
    return JSON.parse(subnetIds);
  } catch (e) {
    console.error(e); // NOSONAR
  }
  return [];
};

const getSecurityGroup = () => {
  try {
    const securityGroup = process.env?.SECURITY_GROUPS || "";
    return JSON.parse(securityGroup);
  } catch (e) {
    console.error(e); // NOSONAR
  }
  return [];
};

new LambdaStack(app, "lambda", {// NOSONAR
  path: codePath,
  handler: "handlers/api-gateway.handler",
  runtime: nodeRuntime,
  version: "v0.0.1",
  layerPath: layerPath,
  isApiRequired: true,
  securityGroupIds: getSecurityGroup(),
  subnetIds: getSubnetIds(),
});

new SqsStack(app, "sqs", {// NOSONAR
  path: codePath,
  handler: "handlers/sqs.handler",
  runtime: nodeRuntime,
  version: "v0.0.1",
  layerPath: layerPath,
  delay: 90,
  maxMessageSize: 2048,
  batchSize: 10,
  messageRetentionSeconds: 86400,
  receiveWaitTimeSeconds: 10,
  maxReceiveCount: 5,
  securityGroupIds: getSecurityGroup(),
  subnetIds: getSubnetIds(),
  kmsMasterKeyId: "alias/aws/sqs",
  kmsDataKeyReusePeriodSeconds: 300,
});

new SnsStack(app, "sns", {// NOSONAR
  path: codePath,
  handler: "handlers/sns.handler",
  runtime: nodeRuntime,
  version: "v0.0.1",
  layerPath: layerPath,
  snsTopicProtocol: "lambda",
  lambdaStatementId: "AllowExecutionFromSNS",
  lambdaAction: "lambda:InvokeFunction",
  lambdaPrincipal: "sns.amazonaws.com",
  securityGroupIds: getSecurityGroup(),
  subnetIds: getSubnetIds(),
  kmsMasterKeyId: "alias/aws/sns",
});

new CronModule(app, "cron", {// NOSONAR
  path: codePath,
  handler: "handlers/cron.handler",
  runtime: nodeRuntime,
  version: "v0.0.1",
  layerPath: layerPath,
  scheduleExpression:"rate(1 day)"
});

new ElasticacheStack(app, "elasticache", {// NOSONAR
  path: codePath,
  handler: "handlers/elasticache.handler",
  runtime: nodeRuntime,
  version: "v0.0.1",
  layerPath: layerPath,
  namespace: process.env.NAMESPACE || '',
  environment:process.env.ENV || '',
  envVars:{
    redisEndpoint:process.env.REDIS_ENDPOINT || '',
  }
});

app.synth();
