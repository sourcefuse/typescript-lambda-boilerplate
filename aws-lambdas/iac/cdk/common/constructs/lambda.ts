import * as aws from "@cdktf/provider-aws";
import { LambdaFunctionVpcConfig } from "@cdktf/provider-aws/lib/lambda-function";
import { AssetType, TerraformAsset } from "cdktf";
import { Construct } from "constructs";
import { iamRolePolicy, lambdaRolePolicy } from "../constants";
import { LambdaFunctionBaseConfig } from "../interfaces";
import { getResourceName } from "../utils/helper";

interface LambdaFunctionConfig extends LambdaFunctionBaseConfig {
  name: string;
}

export class Lambda extends Construct {
  arn: string;
  functionName: string;
  lambda: aws.lambdaFunction.LambdaFunction;

  constructor(scope: Construct, id: string, config: LambdaFunctionConfig) {
    super(scope, id);

    const name = getResourceName({
      namespace: config.namespace,
      environment: config.environment,
      randomName: config.name,
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

    // Create Lambda role
    const role = new aws.iamRole.IamRole(this, "lambda-exec", {
      name,
      assumeRolePolicy: JSON.stringify(iamRolePolicy),
    });

    const lambdaRole = new aws.iamPolicy.IamPolicy(this, "lambda-policy", {
      policy: JSON.stringify(lambdaRolePolicy),
    });

    // Add execution role for lambda to write to CloudWatch logs
    new aws.iamRolePolicyAttachment.IamRolePolicyAttachment( // NOSONAR
      this,
      "lambda-managed-policy",
      {
        policyArn: lambdaRole.arn,
        role: role.name,
      }
    );

    // Create Lambda function
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

    if (config.envVars) {
      lambdaFunc.putEnvironment({ variables: config.envVars });
    }

    this.lambda = lambdaFunc;
    this.arn = lambdaFunc.arn;
    this.functionName = lambdaFunc.functionName;
  }
}
