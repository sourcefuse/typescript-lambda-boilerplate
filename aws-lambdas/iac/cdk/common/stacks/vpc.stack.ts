import {TerraformStack,AssetType, TerraformAsset, TerraformOutput} from 'cdktf';
import {Construct} from 'constructs';
import * as aws from '@cdktf/provider-aws';
import {VpcConfig} from '../interfaces';
import * as random from '../../.gen/providers/random';
import { vpcRoleArn, vpcRolePolicy } from '../constants';
export class VpcStack extends TerraformStack {
  constructor(scope: Construct, name: string, config: VpcConfig) {
    super(scope, name);
    console.log(config.path)
    new aws.AwsProvider(this, 'aws', {
      region: process.env.AWS_REGION,
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretKey: process.env.AWS_SECRET_ACCESS_KEY,
      profile: process.env.AWS_PROFILE,
      assumeRole: {
       roleArn: process.env.AWS_ROLE_ARN,
      }
    });

    // Creating Archive of Lambda
    const asset = new TerraformAsset(this, 'lambda-asset', {
        path: config.path,
        type: AssetType.ARCHIVE, // if left empty it infers directory and file
      });


    new random.RandomProvider(this, 'random');

    // Create random value
    const pet = new random.Pet(this, 'random-name', {
      length: 2,
    });

      const role = new aws.iam.IamRole(this, 'vpc-exec', {
        name: `sqs-role-${name}-${pet.id}`,
        assumeRolePolicy: JSON.stringify(vpcRolePolicy),
      });
   
   
       // Add execution role for lambda to write to CloudWatch logs
      new aws.iam.IamRolePolicyAttachment(this, 'vpc-managed-policy', {
             policyArn: vpcRoleArn,
             role: role.name,
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
    
    //creating lambda function to run inside a VPC
   const lambdaFun = new aws.lambdafunction.LambdaFunction(this, 'lambda-function', {
      functionName: `cdktf-vpc-${name}-${pet.id}`,
      filename: asset.path,
      handler: config.handler,
      runtime: config.runtime,
      role: role.arn,
      layers,
      vpcConfig: {
        subnetIds: config.subnetIds,
        securityGroupIds: config.securityGroupIds
      }
    });

    new TerraformOutput(this, "output", {
      value: lambdaFun.arn,
    });
  }

}
