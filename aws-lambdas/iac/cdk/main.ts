import { App } from "cdktf";
import * as dotenv from "dotenv";
import * as dotenvExt from "dotenv-extended";
import { resolve } from "path";
import { LambdaStack, SnsStack, SqsStack } from "./common";

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
const securityGroupIds = ["sg-07f481ec2ced54878"];
const subnetIds = ["subnet-01c22b0adf9cdd8df", "subnet-0b32fea3b2e13a6ba"];

new LambdaStack(app, "lambda", { // NOSONAR
  path: codePath,
  handler: "handlers/api-gateway.handler",
  runtime: nodeRuntime,
  version: "v0.0.1",
  layerPath: layerPath,
  isApiRequired: true,
  securityGroupIds,
  subnetIds,
});

new SqsStack(app, "sqs", { // NOSONAR
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
  securityGroupIds,
  subnetIds,
  kmsMasterKeyId: "alias/aws/sqs",
  kmsDataKeyReusePeriodSeconds: 300,
});

new SnsStack(app, "sns", { // NOSONAR
  path: codePath,
  handler: "handlers/sns.handler",
  runtime: nodeRuntime,
  version: "v0.0.1",
  layerPath: layerPath,
  snsTopicProtocol: "lambda",
  lambdaStatementId: "AllowExecutionFromSNS",
  lambdaAction: "lambda:InvokeFunction",
  lambdaPrincipal: "sns.amazonaws.com",
  securityGroupIds,
  subnetIds,
  kmsMasterKeyId: "alias/aws/sns",
});

app.synth();
