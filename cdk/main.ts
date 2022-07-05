import * as path from "path";
import { Construct } from "constructs";
import {
  App,
  TerraformStack,
  TerraformAsset,
  AssetType,
  TerraformOutput,
} from "cdktf";

import * as aws from "@cdktf/provider-aws";
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });
interface LambdaFunctionConfig {
  path: any;
  handler: string;
  runtime: string;
  stageName: string;
  version: string;
}

const lambdaRolePolicy = {
  Version: "2012-10-17",
  Statement: [
    {
      Action: "sts:AssumeRole",
      Principal: {
        Service: "lambda.amazonaws.com",
      },
      Effect: "Allow",
      Sid: "",
    },
  ],
};

class LambdaStack extends TerraformStack {
  constructor(scope: Construct, name: string, config: LambdaFunctionConfig) {
    super(scope, name);

    new aws.AwsProvider(this, "aws", {
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
    const asset = new TerraformAsset(this, "lambda-asset", {
      path: path.resolve(__dirname, config.path),
      type: AssetType.ARCHIVE, // if left empty it infers directory and file
    });

    // Create unique S3 bucket that hosts Lambda executable

    let bucketname = process.env.bucketname ? process.env.bucketname:"nobucket";
    if (bucketname === "nobucket") {
      const bucket = new aws.s3.S3Bucket(this, "bucket", {
        bucketPrefix: process.env.bucketprefix,
      });
      bucketname = bucket.bucket;
    }
    // Upload Lambda zip file to newly created S3 bucket
    const lambdaArchive = new aws.s3.S3Object(this, "lambda-archive", {
      bucket: bucketname,
      key: `${config.version}/${asset.fileName}`,
      source: asset.path, // returns a posix path
    });

    // Create Lambda role
    const role = new aws.iam.IamRole(this, "lambda-role", {
      name: `lambda-role-${name}`,
      assumeRolePolicy: JSON.stringify(lambdaRolePolicy),
    });

    // Add execution role for lambda to write to CloudWatch logs
    new aws.iam.IamRolePolicyAttachment(this, "lambda-managed-policy", {
      policyArn:
        "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole", // ARN will be different for IAM role
      role: role.name,
    });

    // Create Lambda function
    const lambdaFunction = new aws.lambdafunction.LambdaFunction(
      this,
      "cdktf-lambda",
      {
        functionName: `cdktf-${name}`,
        s3Bucket: bucketname,
        s3Key: lambdaArchive.key,
        handler: config.handler,
        runtime: config.runtime,
        role: role.arn,
      }
    );
     const apiGw = process.env.apigateway;

    // Create and configure API gateway
    if(apiGw === "true"){
    const api = new aws.apigatewayv2.Apigatewayv2Api(this, "api-gw", {
      name: name,
      protocolType: "HTTP",
      target: lambdaFunction.arn,
    });

    new aws.lambdafunction.LambdaPermission(this, "apigw-lambda", {
      functionName: lambdaFunction.functionName,
      action: "lambda:InvokeFunction",
      principal: "apigateway.amazonaws.com",
      sourceArn: `${api.executionArn}/*/*`,
    });

    new TerraformOutput(this, "url", {
      value: api.apiEndpoint,
    });
  }
 }
}

const app = new App();

new LambdaStack(app, "lambda", {
  path: process.env.path,
  handler: "index.handler",
  runtime: "nodejs14.x",
  stageName: "lambda",
  version: "v0.0.1",
});

app.synth();
