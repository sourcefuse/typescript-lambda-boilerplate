# Terraform: Lambda Boilerplate

See the [README](../../../README.md) in the repo's root for more information.  

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | 4.20.1 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | 4.20.1 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_boilerplate"></a> [boilerplate](#module\_boilerplate) | ./lambda | n/a |
| <a name="module_sns"></a> [sns](#module\_sns) | ./lambda | n/a |
| <a name="module_sqs"></a> [sqs](#module\_sqs) | ./lambda | n/a |
| <a name="module_tags"></a> [tags](#module\_tags) | git::https://github.com/sourcefuse/terraform-aws-refarch-tags | 1.0.1 |

## Resources

| Name | Type |
|------|------|
| [aws_iam_policy.sqs](https://registry.terraform.io/providers/hashicorp/aws/4.20.1/docs/resources/iam_policy) | resource |
| [aws_iam_role_policy_attachment.lambda_sqs](https://registry.terraform.io/providers/hashicorp/aws/4.20.1/docs/resources/iam_role_policy_attachment) | resource |
| [aws_lambda_event_source_mapping.event_source_mapping](https://registry.terraform.io/providers/hashicorp/aws/4.20.1/docs/resources/lambda_event_source_mapping) | resource |
| [aws_lambda_permission.with_sns](https://registry.terraform.io/providers/hashicorp/aws/4.20.1/docs/resources/lambda_permission) | resource |
| [aws_sns_topic.this](https://registry.terraform.io/providers/hashicorp/aws/4.20.1/docs/resources/sns_topic) | resource |
| [aws_sns_topic_subscription.topic_lambda](https://registry.terraform.io/providers/hashicorp/aws/4.20.1/docs/resources/sns_topic_subscription) | resource |
| [aws_sqs_queue.results_updates](https://registry.terraform.io/providers/hashicorp/aws/4.20.1/docs/resources/sqs_queue) | resource |
| [aws_sqs_queue.results_updates_dl_queue](https://registry.terraform.io/providers/hashicorp/aws/4.20.1/docs/resources/sqs_queue) | resource |
| [aws_iam_policy_document.sqs](https://registry.terraform.io/providers/hashicorp/aws/4.20.1/docs/data-sources/iam_policy_document) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_environment"></a> [environment](#input\_environment) | Name of the environment resources will be created in. | `string` | `"dev"` | no |
| <a name="input_kms_key_admin_arns"></a> [kms\_key\_admin\_arns](#input\_kms\_key\_admin\_arns) | Additional IAM roles to map to the KMS key policy for administering the KMS key used for SSE. | `list(string)` | `[]` | no |
| <a name="input_lambda_event_source_mapping_batch_size"></a> [lambda\_event\_source\_mapping\_batch\_size](#input\_lambda\_event\_source\_mapping\_batch\_size) | The largest number of records that Lambda will retrieve from your event source at the time of invocation. Defaults to 100 for DynamoDB, Kinesis, MQ and MSK, 10 for SQS. | `number` | `10` | no |
| <a name="input_lambda_event_source_mapping_enabled"></a> [lambda\_event\_source\_mapping\_enabled](#input\_lambda\_event\_source\_mapping\_enabled) | Determines if the mapping will be enabled on creation. | `bool` | `true` | no |
| <a name="input_lambda_runtime"></a> [lambda\_runtime](#input\_lambda\_runtime) | Lambda runtime | `string` | `"nodejs16.x"` | no |
| <a name="input_lambda_sqs_policy_name"></a> [lambda\_sqs\_policy\_name](#input\_lambda\_sqs\_policy\_name) | Name to assign the Lambda SQS Policy | `string` | `"lambda-sqs"` | no |
| <a name="input_profile"></a> [profile](#input\_profile) | Name of the AWS Profile configured on your workstation. | `string` | n/a | yes |
| <a name="input_region"></a> [region](#input\_region) | Name of the region resources will be created in. | `string` | `"us-east-1"` | no |
| <a name="input_sns_topic_name"></a> [sns\_topic\_name](#input\_sns\_topic\_name) | Name to assign the SNS Topic. | `string` | `"sns-with-lambda"` | no |
| <a name="input_sqs_results_updates"></a> [sqs\_results\_updates](#input\_sqs\_results\_updates) | Name to assign the SQS Results Updates Queue. | `string` | `"results-updates-queue"` | no |
| <a name="input_sqs_results_updates_dlq"></a> [sqs\_results\_updates\_dlq](#input\_sqs\_results\_updates\_dlq) | Name to assign the SQS Results Updates Dead Letter Queue. | `string` | `"results-updates-dl-queue"` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_lambda_boilerplate_arn"></a> [lambda\_boilerplate\_arn](#output\_lambda\_boilerplate\_arn) | n/a |
| <a name="output_lambda_boilerplate_name"></a> [lambda\_boilerplate\_name](#output\_lambda\_boilerplate\_name) | n/a |
| <a name="output_lambda_boilerplate_version"></a> [lambda\_boilerplate\_version](#output\_lambda\_boilerplate\_version) | n/a |
| <a name="output_lambda_sns_arn"></a> [lambda\_sns\_arn](#output\_lambda\_sns\_arn) | n/a |
| <a name="output_lambda_sns_name"></a> [lambda\_sns\_name](#output\_lambda\_sns\_name) | n/a |
| <a name="output_lambda_sns_version"></a> [lambda\_sns\_version](#output\_lambda\_sns\_version) | n/a |
| <a name="output_lambda_sqs_arn"></a> [lambda\_sqs\_arn](#output\_lambda\_sqs\_arn) | n/a |
| <a name="output_lambda_sqs_name"></a> [lambda\_sqs\_name](#output\_lambda\_sqs\_name) | n/a |
| <a name="output_lambda_sqs_version"></a> [lambda\_sqs\_version](#output\_lambda\_sqs\_version) | n/a |
<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
