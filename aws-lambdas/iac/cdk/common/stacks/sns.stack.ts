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
import { iamRolePolicy, snsRolePolicy } from "../constants";
import { AwsProvider } from "../constructs/awsProvider";
import { SnsFunctionConfig } from "../interfaces";

export class SnsStack extends TerraformStack {
  constructor(scope: Construct, name: string, config: SnsFunctionConfig) {
    super(scope, name);

    new AwsProvider(this, "aws"); // NOSONAR

    // Creating Archive of Lambda
    const asset = new TerraformAsset(this, "lambda-asset", {
      path: config.path,
      type: AssetType.ARCHIVE, // if left empty it infers directory and file
    });

    new random.provider.RandomProvider(this, 'random');// NOSONAR

    // Create random value
    const pet = new random.pet.Pet(this, "random-name", {
      length: 2,
    });

    const role = new aws.iamRole.IamRole(this, "sns-exec", {
      name: `sns-role-${name}-${pet.id}`,
      assumeRolePolicy: JSON.stringify(iamRolePolicy),
    });

    const snsRoleArn = new aws.iamPolicy.IamPolicy(this, "sns-policy", {
      policy: JSON.stringify(snsRolePolicy),
    });

    // Add execution role for lambda to write to CloudWatch logs
    new aws.iamRolePolicyAttachment.IamRolePolicyAttachment(this, "sns-managed-policy", {// NOSONAR
      policyArn: snsRoleArn.arn,
      role: role.name,
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
          layerName: `${name}-layers-${pet.id}`,
        }
      );

      layers.push(lambdaLayers.arn);
    }

    const awsSnsTopic = new aws.snsTopic.SnsTopic(this, "sns-topic", {
      name: `sns-topic-${name}-${pet.id}`,
      kmsMasterKeyId: config.kmsMasterKeyId,
    });

    const lambdaFunc = new aws.lambdaFunction.LambdaFunction(
      this,
      "lambda-function",
      {
        functionName: `cdktf-sns-${name}-${pet.id}`,
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

    new aws.snsTopicSubscription.SnsTopicSubscription(this, "sns-topic-subscription", { // NOSONAR
      topicArn: awsSnsTopic.arn,
      protocol: config.snsTopicProtocol,
      endpoint: lambdaFunc.arn,
    });

    new aws.lambdaPermission.LambdaPermission( // NOSONAR
      this,
      "lambda-permission-with-sns",
      {
        statementId: config.lambdaStatementId,
        action: config.lambdaAction,
        functionName: lambdaFunc.functionName,
        principal: config.lambdaPrincipal,
        sourceArn: awsSnsTopic.arn,
      }
    );

    new TerraformOutput(this, "function", {// NOSONAR
      value: lambdaFunc.arn,
    });
  }
}
