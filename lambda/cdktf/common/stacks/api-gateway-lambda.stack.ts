import {AssetType, TerraformAsset, TerraformOutput, TerraformStack} from 'cdktf';
import {Construct} from 'constructs';
import * as aws from '@cdktf/provider-aws';
import * as random from '../../.gen/providers/random';
import {lambdaAction, lambdaPolicyArn, lambdaPrincipal, lambdaRolePolicy} from '../constants';
import {ApiGatewayLambdaFunctionConfig} from '../interfaces';

export class ApiGatewayLambdaStack extends TerraformStack {
  constructor(scope: Construct, name: string, config: ApiGatewayLambdaFunctionConfig) {
    super(scope, name);

    new aws.AwsProvider(this, 'aws', {
      region: process.env.AWS_REGION,
      profile: process.env.AWS_PROFILE,
    });

    new random.RandomProvider(this, 'random');

    // Create random value
    const pet = new random.Pet(this, 'random-name', {
      length: 2,
    });

    // Create Lambda executable
    const asset = new TerraformAsset(this, 'lambda-asset', {
      path: config.path,
      type: AssetType.ARCHIVE, // if left empty it infers directory and file
    });

    // Create unique S3 bucket that hosts Lambda executable
    const bucket = new aws.s3.S3Bucket(this, 'bucket', {
      bucketPrefix: `${name}-asset`,
    });

    // Upload Lambda zip file to newly created S3 bucket
    const lambdaArchive = new aws.s3.S3Object(this, 'lambda-archive', {
      bucket: bucket.bucket,
      key: `${config.version}/${asset.fileName}`,
      source: asset.path, // returns a posix path
    });

    // Create Lambda role
    const role = new aws.iam.IamRole(this, 'lambda-exec', {
      name: `${name}-${pet.id}`,
      assumeRolePolicy: JSON.stringify(lambdaRolePolicy),
    });

    // Add execution role for lambda to write to CloudWatch logs
    new aws.iam.IamRolePolicyAttachment(this, 'lambda-managed-policy', {
      policyArn: lambdaPolicyArn,
      role: role.name,
    });

    const lambdaLayers = new aws.lambdafunction.LambdaLayerVersion(this, 'lambda-layer', {
      filename: config.layerPath,
      layerName: `${name}-layers`,
    });
    // Create Lambda function
    const lambdaFunc = new aws.lambdafunction.LambdaFunction(this, 'lambda-function', {
      functionName: `${name}-${pet.id}`,
      s3Bucket: bucket.bucket,
      s3Key: lambdaArchive.key,
      handler: config.handler,
      runtime: config.runtime,
      role: role.arn,
      layers: [lambdaLayers.arn],
    });

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
}
