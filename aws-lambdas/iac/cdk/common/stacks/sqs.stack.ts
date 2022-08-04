import {TerraformStack,AssetType, TerraformAsset} from 'cdktf';
import {Construct} from 'constructs';
import * as aws from '@cdktf/provider-aws';
import {batchSize, delay, maxMessageSize, sqsRoleArn,sqsRolePolicy} from '../constants';
import {SqsFunctionConfig} from '../interfaces';
import * as random from '../../.gen/providers/random';
export class SqsStack extends TerraformStack {
  constructor(scope: Construct, name: string, config: SqsFunctionConfig) {
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
    new random.RandomProvider(this, 'random');

    // Create random value
    const pet = new random.Pet(this, 'random-name', {
      length: 2,
    });

    const role = new aws.iam.IamRole(this, 'sqs-exec', {
      name: `sqs-role-${name}-${pet.id}`,
       assumeRolePolicy: JSON.stringify(sqsRolePolicy),
    });
 
 
     // Add execution role for lambda to write to CloudWatch logs
    new aws.iam.IamRolePolicyAttachment(this, 'sqs-managed-policy', {
           policyArn: sqsRoleArn,
           role: role.name,
      });

   // Create SqsQueue
   const awsSqsQueue = new aws.sqs.SqsQueue(this,'sqs-queue',{
    delaySeconds: delay,
    maxMessageSize: maxMessageSize,
    name: `sqs-queue-${name}-${pet.id}`,
    policy: JSON.stringify(sqsRolePolicy)
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

    const lambdaFunc = new aws.lambdafunction.LambdaFunction(this, 'lambda-function', {
      functionName: `cdktf-sqs-${name}-${pet.id}`,
      filename: asset.path,
      handler: config.handler,
      runtime: config.runtime,
      role: role.arn,
    });

    new aws.lambdafunction.LambdaEventSourceMapping(this,"event-source-mapping",{
        eventSourceArn: awsSqsQueue.arn,
        enabled: true,
        functionName: lambdaFunc.arn,
        batchSize: batchSize
    })

  }
}
