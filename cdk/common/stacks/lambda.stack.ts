import {AssetType, TerraformAsset, TerraformOutput, TerraformStack} from 'cdktf';
import {Construct} from 'constructs';
import * as aws from '@cdktf/provider-aws';
import {lambdaAction, lambdaPolicyArn, lambdaPrincipal, lambdaRolePolicy} from '../constants';
import {LambdaFunctionConfig} from '../interfaces';
import * as random from '../../.gen/providers/random';

export class LambdaStack extends TerraformStack {
  constructor(scope: Construct, name: string, config: LambdaFunctionConfig) {
    super(scope, name);

    new aws.AwsProvider(this, 'aws', {
      region: process.env.AWS_REGION,
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretKey: process.env.AWS_SECRET_ACCESS_KEY,
      assumeRole: {
       roleArn: process.env.AWS_ROLE_ARN,
      }
    });
    new random.RandomProvider(this, 'random');

    // Create random value
    const pet = new random.Pet(this, 'random-name', {
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
      const lambdaLayers = new aws.lambdafunction.LambdaLayerVersion(this, 'lambda-layer', {
        filename: layerAsset.path,
        layerName: `${name}-layers-${pet.id}`,
      });

      layers.push(lambdaLayers.arn);
    }

    // Create Lambda role
    const role = new aws.iam.IamRole(this, 'lambda-exec', {
      name: `lambda-role-${name}-${pet.id}`,
      assumeRolePolicy: JSON.stringify(lambdaRolePolicy),
    });

    // Add execution role for lambda to write to CloudWatch logs
    new aws.iam.IamRolePolicyAttachment(this, 'lambda-managed-policy', {
      policyArn: lambdaPolicyArn,
      role: role.name,
    });

    // Create Lambda function
    const lambdaFunc = new aws.lambdafunction.LambdaFunction(this, 'lambda-function', {
      functionName: `cdktf-${name}-${pet.id}`,
      filename: asset.path,
      handler: config.handler,
      runtime: config.runtime,
      role: role.arn,
      layers,
    });

    if(config.isApiRequired) {
      // Create and configure API gateway
      const api = new aws.apigatewayv2.Apigatewayv2Api(this, 'api-gw', {
        name,
        protocolType: 'HTTP',
        target: lambdaFunc.arn,
      });

      new aws.lambdafunction.LambdaPermission(this, 'apigw-lambda-permission', {
        functionName: lambdaFunc.functionName,
        action: lambdaAction,
        principal: lambdaPrincipal,
        sourceArn: `${api.executionArn}/*/*`,
      });

      new TerraformOutput(this, 'url', {
        value: api.apiEndpoint,
      });
    }

    new TerraformOutput(this, 'function', {
      value: lambdaFunc.arn,
    });
  }
}
