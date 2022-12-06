# CDK Module For Lambda

We can use the Cloud Development Kit for Terraform (CDKTF) to define advanced deployment configurations.

CDKTF stacks let us manage multiple Terraform configurations in the same CDKTF application. They can save us from writing repetitive CDKTF code, while allowing us to independently manage the resources in each stack. we can also use the outputs of one stack as inputs for another.

## Getting Started

1. Create a dot env file:  
  ```shell
  touch .env
  ```

3. Configure the following keys in the `.env` file:  
  * **AWS_REGION**: *aws_region*  
  * **AWS_KEY**: *aws_key*   
  * **AWS_ACCESS_KEY_ID**: *aws_access_key*
  * **AWS_SECRET_ACCESS_KEY**: *aws_secret_key*
  * **AWS_ROLE_ARN**: *role_arn*
  * **AWS_PROFILE**: *Path of the dist folder of lambda function*

  Note: if You want to use * **AWS_ACCESS_KEY_ID** and * **AWS_SECRET_ACCESS_KEY** then keep 
  * **AWS_PROFILE** as blank.

3. Run *npm install* to install the dependency packages for cdktf. Now you are ready to go with cdktf commands.

## How to Run
This module gives us several commands for the aws lambda function.  
* To generate the random provider. This configuration uses the random provider to ensure the IAM role name is unique.  
  ```shell
  cdktf get 
  ```
* List all the stacks defined in your CDKTF application.  
  ```shell
  cdktf list
  ``` 
* To deploy the stack on aws and remember to confirm the deploy with a yes.  
  ```shell
  cdktf deploy <stack_name>
  ```
* To destroy the Infrastructure that you deployed on aws.  
  ```shell
  cdktf destroy <stack_name>
  ```

## Stacks

| Name | Version |
|------|--------|
| <a name="LambdaStack"></a> [LambdaStack](#LambdaStack) | 0.0.1 |
| <a name="SqsStack"></a> [sqs](#SqsStack) | 0.0.1 |
| <a name="SnsStack"></a> [sns](#SnsStack) | 0.0.1 |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_LambdaStack_path"></a> [LambdaStack_path](#input\_LambdaStack\_path) | Give the path of the lambda from where the stack will be created. | `string` | `"../../lambda/dist/src"` | yes |
| <a name="input_LambdaStack_handler"></a> [LambdaStack_handler](#input\_LambdaStack\_handler) | Give the handler name from where the stack will be created. | `string` | `"handlers/api-gateway.handler"` | yes |
| <a name="input_LambdaStack_runtime"></a> [LambdaStack_runtime](#input\_LambdaStack\_runtime) | Give the runtime version of the lambda | `string` | `"nodejs16.x"` | yes |
| <a name="input_LambdaStack_version"></a> [LambdaStack_version](#input\_LambdaStack\_version) | Give the version of the stack | `string` | `"v0.0.1"` | yes |
| <a name="input_LambdaStack_layerPath"></a> [LambdaStack_layerPath](#input\_LambdaStack\_layerPath) | Give the layer path of the lambda | `string` | `"../../lambda/dist/layers"` | no |
| <a name="input_LambdaStack_securityGroupIds"></a> [LambdaStack_securityGroupIds](#input\_LambdaStack\_securityGroupIds) | Give the security group id to the lambda | `string` | `"n/a"` | no |
| <a name="input_LambdaStack_subnetIds"></a> [LambdaStack_subnetIds](#input\_LambdaStack\_subnetIds) | Give the subnet Ids to the lambda | `string` | `"n/a"` | no |
| <a name="input_ SqsStack_path"></a> [SqsStack_path](#input\_ SqsStack\_path) | Give the path of the lambda from where the stack will be created | `string` | `"../../lambda/dist/src"` | yes |
| <a name="input_ SqsStack_handler"></a> [SqsStack_handler](#input\_ SqsStack\_handler) | Give the handler name from where the stack will be created. | `string` | `"handlers/sqs.handler"` | yes |
| <a name="input_SqsStack_runtime"></a> [SqsStack_runtime](#input\_SqsStack\_runtime) | Give the runtime version of the lambda | `string` | `"nodejs16.x"` | yes |
| <a name="input_SqsStack_version"></a> [SqsStack_version](#input\_SqsStack\_version) | Give the version of the stack | `string` | `"v0.0.1"` | yes |
| <a name="input_SqsStack_layerPath"></a> [SqsStack_layerPath](#input\_LambdaStack\_layerPath) | Give the layer path of the lambda | `string` | `"../../lambda/dist/layers"` | no |
| <a name="input_SqsStack_delay"></a> [SqsStack_delay](#input\_LambdaStack\_delay) | The time in seconds that the delivery of all messages in the queue will be delayed | `number` | `90` | no |
| <a name="input_SqsStack_ maxMessageSize"></a> [SqsStack_maxMessageSize](#input\_LambdaStack\_maxMessageSize) | The limit of how many bytes a message can contain before Amazon SQS rejects it | `number` | `2048` | no |
| <a name="input_SqsStack_ batchSize"></a> [SqsStack_batchSize](#input\_LambdaStack\_batchSize) | The largest number of records that Lambda will retrieve from your event source at the time of invocation | `number` | `10` | no |
| <a name="input_SqsStack_messageRetentionSeconds "></a> [SqsStack_messageRetentionSeconds](#input\_LambdaStack\_messageRetentionSeconds) | The number of seconds Amazon SQS retains a message. | `number` | `86400` | no |
| <a name="input_SqsStack_receiveWaitTimeSeconds "></a> [SqsStack_receiveWaitTimeSeconds](#input\_LambdaStack\_receiveWaitTimeSeconds) | The time for which a ReceiveMessage call will wait for a message to arrive (long polling) before returning. | `number` | `10` | no |
| <a name="input_SqsStack_redriveMaxCount "></a> [SqsStack_redriveMaxCount](#input\_LambdaStack\_redriveMaxCount) | he JSON redrive policy for the SQS queue. Accepts two key/val pairs: deadLetterTargetArn and maxReceiveCount | `number` | `5` | no |
| <a name="input_SqsStack_securityGroupIds"></a> [SqsStack_securityGroupIds](#input\_SqsStack\_securityGroupIds) | Give the security group id to the lambda | `string` | `"n/a"` | no |
| <a name="input_SqsStack_subnetIds"></a> [SqsStack_subnetIds](#input\_SqsStack\_subnetIds) | Give the subnet Ids to the lambda | `string` | `"n/a"` | no |
| <a name="input_SqsStack_kmsMasterKeyId"></a> [SqsStack_kmsMasterKeyId](#input\_SqsStack\_kmsMasterKeyId) | Name to assign the name of SQS KMS MASTER KEY ID. | `string` | `"alias/aws/sqs"` | no |
| <a name="input_SqsStack_kmsDataKeyReusePeriodSeconds"></a> [SqsStack_kmsDataKeyReusePeriodSeconds](#input\_SqsStack\_kmsDataKeyReusePeriodSeconds) | The length of time, in seconds, for which Amazon SQS can reuse a data key to encrypt or decrypt messages before calling AWS KMS again. | `number` | `300` | no |
| <a name="input_ SnsStack_path"></a> [SnsStack_path](#input\_ SnsStack\_path) | Give the path of the lambda from where the stack will be created | `string` | `"../../lambda/dist/src"` | yes |
| <a name="input_SnsStack_handler"></a> [SnsStack_handler](#input\_SnsStack\_handler) | Give the handler name from where the stack will be created. | `string` | `"handlers/sns.handler"` | yes |
| <a name="input_SnsStack_runtime"></a> [SnsStack_runtime](#input\_SnsStack\_runtime) | Give the runtime version of the lambda | `string` | `"nodejs16.x"` | yes |
| <a name="input_SnsStack_version"></a> [SnsStack_version](#input\_SnsStack\_version) | Give the version of the stack | `string` | `"v0.0.1"` | yes |
| <a name="input_SnsStack_layerPath"></a> [SnsStack_layerPath](#input\_SnsStack\_layerPath) | Give the layer path of the lambda | `string` | `"../../lambda/dist/layers"` | no |
| <a name="input_SnsStack_lambdaStatementId"></a> [SnsStack_lambdaStatementId](#input\_SnsStack\_lambdaStatementId) | A unique statement identifier | `string` | `"AllowExecutionFromSNS"` | no |
| <a name="input_SnsStack_snsTopicProtocol"></a> [SnsStack_snsTopicProtocol](#input\_SnsStack\_snsTopicProtocol) | sns supports various types of protocols like http , https , lambda , email-json and sms | `string` | `"lambda"` | no |
| <a name="input_SnsStack_securityGroupIds"></a> [SnsStack_securityGroupIds](#input\_SnsStack\_securityGroupIds) | Give the security group id to the lambda | `string` | `"n/a"` | no |
| <a name="input_SnsStack_subnetIds"></a> [SnsStack_subnetIds](#input\_SnsStack\_subnetIds) | Give the subnet Ids to the lambda | `string` | `"n/a"` | no |
| <a name="input_SnsStack_kmsMasterKeyId"></a> [SnsStack_kmsMasterKeyId](#input\_SnsStack\_kmsMasterKeyId) | Name to assign the name of SNS KMS MASTER KEY ID. | `string` | `"alias/aws/sns"` | no |


