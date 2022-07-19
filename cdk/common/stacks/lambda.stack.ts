import {AssetType, TerraformAsset, TerraformOutput, TerraformStack} from 'cdktf';
import {Construct} from 'constructs';
import * as aws from '@cdktf/provider-aws';
import {lambdaAction, lambdaPolicyArn, lambdaPrincipal, lambdaRolePolicy} from '../constants';
import {ApiGatewayLambdaFunctionConfig} from '../interfaces';

export class LambdaStack extends TerraformStack {
  constructor(scope: Construct, name: string, config: ApiGatewayLambdaFunctionConfig) {
    super(scope, name);

    new aws.AwsProvider(this, 'aws', {
      region: process.env.region,
      accessKey: process.env.accessKey,
      secretKey: process.env.secretKey,
      allowedAccountIds: [
        process.env.allowedAccountIds ?? "accountId"
      ],
      assumeRole: {
       roleArn: process.env.roleArn,
      }
    });

    // Create Lambda executable
    new TerraformAsset(this, 'lambda-asset', {
      path: config.path,
      type: AssetType.ARCHIVE, // if left empty it infers directory and file
    });

    // Create unique S3 bucket that hosts Lambda executable
    // const bucket = new aws.s3.S3Bucket(this, 'bucket', {
    //   bucketPrefix: `${name}-asset`,
    // });

    // Upload Lambda zip file to newly created S3 bucket
    // const lambdaArchive = new aws.s3.S3Object(this, 'lambda-archive', {
    //   bucket: bucket.bucket,
    //   key: `${config.version}/${asset.fileName}`,
    //   source: asset.path, // returns a posix path
    // });

    // Create Lambda role
    const role = new aws.iam.IamRole(this, 'lambda-exec', {
      name: `lambda-role-${name}`,
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
      functionName: `cdktf-${name}`,
      //s3Bucket: bucket.bucket,
      //s3Key: lambdaArchive.key,
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
