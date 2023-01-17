import * as aws from '@cdktf/provider-aws';
import { LambdaFunctionVpcConfig } from '@cdktf/provider-aws/lib/lambda-function';
import * as random from '@cdktf/provider-random';
import {
  AssetType,
  TerraformAsset,
  TerraformOutput,
  TerraformStack
} from 'cdktf';
import { Construct } from 'constructs';
import {
  iamRolePolicy,
  lambdaAction,
  lambdaPrincipal,
  lambdaRolePolicy
} from '../constants';
import { LambdaFunctionConfig } from '../interfaces';

const defaultLambdaMemory = 128;
export class LambdaStack extends TerraformStack {
  constructor(scope: Construct, name: string, config: LambdaFunctionConfig) {
    super(scope, name);

    // sonarignore:start
    new aws.provider.AwsProvider(this, 'aws', {
      region: process.env.AWS_REGION,
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretKey: process.env.AWS_SECRET_ACCESS_KEY,
      profile: process.env.AWS_PROFILE,
      assumeRole: [
        {
          roleArn: process.env.AWS_ROLE_ARN,
        },
      ],
    });
    new random.provider.RandomProvider(this, 'random');
    // sonarignore:end

    // Create random value
    const pet = new random.pet.Pet(this, 'random-name', {
      length: 2,
    });

    // Creating Archive of Lambda
    const asset = new TerraformAsset(this, 'lambda-asset', {
      path: config.path,
      type: AssetType.ARCHIVE, // if left empty it infers directory and file
    });

    const layers = [];
    if (config.layerPath) {
      // Creating Archive of Lambda Layer
      const layerAsset = new TerraformAsset(this, 'lambda-layer-asset', {
        path: config.layerPath,
        type: AssetType.ARCHIVE, // if left empty it infers directory and file
      });
      // Create Lambda Layer for function
      const lambdaLayers = new aws.lambdaLayerVersion.LambdaLayerVersion(
        this,
        'lambda-layer',
        {
          filename: layerAsset.path,
          layerName: `${name}-layers-${pet.id}`,
        },
      );

      layers.push(lambdaLayers.arn);
    }

    // Create Lambda role
    const role = new aws.iamRole.IamRole(this, 'lambda-exec', {
      name: `lambda-role-${name}-${pet.id}`,
      assumeRolePolicy: JSON.stringify(iamRolePolicy),
    });

    const lambdaRole = new aws.iamPolicy.IamPolicy(this, 'lambda-policy', {
      policy: JSON.stringify(lambdaRolePolicy),
    });

    // sonarignore:start
    // Add execution role for lambda to write to CloudWatch logs
    new aws.iamRolePolicyAttachment.IamRolePolicyAttachment(
      this,
      'lambda-managed-policy',
      {
        policyArn: lambdaRole.arn,
        role: role.name,
      },
    );
    // sonarignore:end

    // Create Lambda function
    const lambdaFunc = new aws.lambdaFunction.LambdaFunction(
      this,
      'lambda-function',
      {
        functionName: `cdktf-${name}-${pet.id}`,
        filename: asset.path,
        handler: config.handler,
        runtime: config.runtime,
        role: role.arn,
        memorySize: config?.memorySize || defaultLambdaMemory,
        layers: layers.length ? layers : undefined,
        environment: {variables: config.envVars},
        timeout: config?.timeout,
      },
    );

    if (config?.invocationData) {
      // sonarignore:start
      new aws.dataAwsLambdaInvocation.DataAwsLambdaInvocation(
        this,
        'invocation',
        {
          functionName: lambdaFunc.functionName,
          input: config.invocationData,
        },
      );
      // sonarignore:end
    }

    //Putting VPC config to lambda function if subnetIds and securityGroupIds exist

    if (config.subnetIds && config.securityGroupIds) {
      const vpcConfig: LambdaFunctionVpcConfig = {
        subnetIds: config.subnetIds,
        securityGroupIds: config.securityGroupIds,
      };
      lambdaFunc.putVpcConfig(vpcConfig);
    }

    if (config.isApiRequired) {
      // Create and configure API gateway
      const api = new aws.apigatewayv2Api.Apigatewayv2Api(this, 'api-gw', {
        name,
        protocolType: 'HTTP',
        target: lambdaFunc.arn,
      });

      // sonarignore:start
      new aws.lambdaPermission.LambdaPermission(
        this,
        'apigw-lambda-permission',
        {
          functionName: lambdaFunc.functionName,
          action: lambdaAction,
          principal: lambdaPrincipal,
          sourceArn: `${api.executionArn}/*/*`,
        },
      );
      // sonarignore:end

      // sonarignore:start
      new TerraformOutput(this, 'url', {
        value: api.apiEndpoint,
      });
      // sonarignore:end
    }

    // sonarignore:start
    new TerraformOutput(this, 'function', {
      value: lambdaFunc.arn,
    });
    // sonarignore:end
  }
}
