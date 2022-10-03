import {TerraformStack,AssetType, TerraformAsset, TerraformOutput} from 'cdktf';
import {Construct} from 'constructs';
import * as aws from '@cdktf/provider-aws';
import {SnsFunctionConfig} from '../interfaces';
import * as random from '../../.gen/providers/random';
import { snsRoleArn, snsRolePolicy } from '../constants';
import { LambdaFunctionVpcConfig } from '@cdktf/provider-aws/lib/lambdafunction';
export class SnsStack extends TerraformStack {
  constructor(scope: Construct, name: string, config: SnsFunctionConfig) {
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

      const role = new aws.iam.IamRole(this, 'sns-exec', {
        name: `sqs-role-${name}-${pet.id}`,
        assumeRolePolicy: JSON.stringify(snsRolePolicy),
      });
   
   
       // Add execution role for lambda to write to CloudWatch logs
      new aws.iam.IamRolePolicyAttachment(this, 'sns-managed-policy', {
             policyArn: snsRoleArn,
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

    const awsSnsTopic = new aws.sns.SnsTopic(this,'sns-topic',{
        name: `sns-topic-${name}-${pet.id}`,
        kmsMasterKeyId: config.kmsMasterKeyId
    });

    const lambdaFunc = new aws.lambdafunction.LambdaFunction(this, 'lambda-function', {
        functionName: `cdktf-sns-${name}-${pet.id}`,
        filename: asset.path,
        handler: config.handler,
        runtime: config.runtime,
        role: role.arn,
        layers
      });

      //Putting VPC config to lambda function if subnetIds and securityGroupIds exist

    if(config.subnetIds && config.securityGroupIds){
      const vpcConfig:LambdaFunctionVpcConfig =  {
       subnetIds: config.subnetIds,
       securityGroupIds: config.securityGroupIds
     }
     lambdaFunc.putVpcConfig(vpcConfig)
     
 }

    new aws.sns.SnsTopicSubscription(this,'sns-topic-subscription',{
        topicArn: awsSnsTopic.arn,
        protocol: config.snsTopicProtocol,
        endpoint: lambdaFunc.arn
    })

    new aws.lambdafunction.LambdaPermission(this,"lambda-permission-with-sns",{
        statementId: config.lambdaStatementId,
        action: config.lambdaAction,
        functionName: lambdaFunc.functionName,
        principal: config.lambdaPrincipal,
        sourceArn: awsSnsTopic.arn
    })

    new TerraformOutput(this, 'function', {
        value: lambdaFunc.arn,
      });

  }

}
