import * as aws from "@cdktf/provider-aws";
import { LambdaFunctionVpcConfig } from "@cdktf/provider-aws/lib/lambda-function";
import {
  AssetType,
  TerraformAsset,
  TerraformOutput,
  TerraformStack
} from "cdktf";
import { Construct } from "constructs";
import * as random from "../../.gen/providers/random";
import { iamRolePolicy, sqsRolePolicy } from "../constants";
import { AwsProvider } from "../constructs/awsProvider";
import { SqsFunctionConfig } from "../interfaces";
import { getResourceName } from "../utils/helper";

export class SqsStack extends TerraformStack {
  constructor(scope: Construct, id: string, config: SqsFunctionConfig) {
    super(scope, id);

    new AwsProvider(this, "aws"); // NOSONAR
    new random.provider.RandomProvider(this, 'random');// NOSONAR

    // Create random value
    const pet = new random.pet.Pet(this, "random-name", {
      length: 2,
    });

    const name = getResourceName({
      namespace: config.namespace,
      environment: config.environment,
      randomName: pet.id,
    });

    const role = new aws.iamRole.IamRole(this, "sqs-exec", {
      name,
      assumeRolePolicy: JSON.stringify(iamRolePolicy),
    });

    const sqsRole = new aws.iamPolicy.IamPolicy(this, "sqs-policy", {
      policy: JSON.stringify(sqsRolePolicy),
    });

    // Add execution role for lambda to write to CloudWatch logs
    new aws.iamRolePolicyAttachment.IamRolePolicyAttachment(this, "sqs-managed-policy", {// NOSONAR
      policyArn: sqsRole.arn,
      role: role.name,
    });

    //Creating DLQueue
    const resultsUpdatesDlQueue = new aws.sqsQueue.SqsQueue(this, "dl-queue", {
      name: `${name}-dlq`,
      kmsMasterKeyId: config.kmsMasterKeyId,
      kmsDataKeyReusePeriodSeconds: config.kmsDataKeyReusePeriodSeconds,
    });

    const redrivePolicy = {
      deadLetterTargetArn: resultsUpdatesDlQueue.arn,
      maxReceiveCount: config.maxReceiveCount,
    };

    // Create SqsQueue
    const awsSqsQueue = new aws.sqsQueue.SqsQueue(this, "sqs-queue", {
      delaySeconds: config.delay,
      maxMessageSize: config.maxMessageSize,
      messageRetentionSeconds: config.messageRetentionSeconds,
      receiveWaitTimeSeconds: config.receiveWaitTimeSeconds,
      name,
      policy: JSON.stringify(sqsRolePolicy),
      redrivePolicy: JSON.stringify(redrivePolicy),
      kmsMasterKeyId: config.kmsMasterKeyId,
      kmsDataKeyReusePeriodSeconds: config.kmsDataKeyReusePeriodSeconds,
    });

    // Creating Archive of Lambda
    const asset = new TerraformAsset(this, "lambda-asset", {
      path: config.path,
      type: AssetType.ARCHIVE, // if left empty it infers directory and file
    });

    const layers = [];
    if (config.layerPath) {
      // Creating Archive of Lambda Layer
      const layerAsset = new TerraformAsset(this, "lambda-layer-asset", {
        path: config.layerPath,
        type: AssetType.ARCHIVE, // if left empty it infers directory and file
      });
      // Create Lambda Layer for function
      const lambdaLayers = new aws.lambdaLayerVersion.LambdaLayerVersion(
        this,
        "lambda-layer",
        {
          filename: layerAsset.path,
          layerName: name,
        }
      );

      layers.push(lambdaLayers.arn);
    }

    const lambdaFunc = new aws.lambdaFunction.LambdaFunction(
      this,
      "lambda-function",
      {
        functionName: name,
        filename: asset.path,
        handler: config.handler,
        runtime: config.runtime,
        role: role.arn,
        layers,
      }
    );

    //Putting VPC config to lambda function if subnetIds and securityGroupIds exist

    if (config.subnetIds && config.securityGroupIds) {
      const vpcConfig: LambdaFunctionVpcConfig = {
        subnetIds: config.subnetIds,
        securityGroupIds: config.securityGroupIds,
      };
      lambdaFunc.putVpcConfig(vpcConfig);
    }

    new aws.lambdaEventSourceMapping.LambdaEventSourceMapping( // NOSONAR
      this,
      "event-source-mapping",
      {
        eventSourceArn: awsSqsQueue.arn,
        enabled: true,
        functionName: lambdaFunc.arn,
        batchSize: config.batchSize,
      }
    );

    new TerraformOutput(this, "function", {// NOSONAR
      value: lambdaFunc.arn,
    });
  }
}
