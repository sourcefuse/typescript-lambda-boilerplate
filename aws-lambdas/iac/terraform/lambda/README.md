# Terraform Module: Lambda Boilerplate 

## Overview

Terraform module that manages the infrastructure dependencies for the Lambda Boilerplate utilities

## <a id="usage"></a> Usage
Here is an example of what a new lambda would look like, using the default values defined in [variables.tf](variables.tf).  

Since All Lambda code is contained within the same `src` folder, you can keep the `lambda_function_archive_*` and `lambda_layer_archive_*` 
as the default values. The important variable to override is going to be `lambda_handler`.  

```hcl
module "lambda" {
  source = "./lambda"

  environment = "dev"
  region      = "us-east-1"

  lambda_runtime = "nodejs16.x"
  lambda_handler = "index.handler"
  lambda_memory  = 128
  lambda_timeout = 120

  lambda_function_archive_source_dir  = "${path.root}/dist/src"
  lambda_function_archive_output_path = "${path.root}/dist/function.zip"
  lambda_layer_archive_source_dir     = "${path.root}/dist/layers"
  lambda_layer_archive_output_path    = "${path.root}/dist/layers.zip"

  kms_key_admin_arns = var.kms_key_admin_arns

  tags = {
    Name    = "lambda-boilerplate"
    Example = "True"
  }
}
```

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | ~> 1.3 |
| <a name="requirement_archive"></a> [archive](#requirement\_archive) | ~> 2.2 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | ~> 4.20 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_archive"></a> [archive](#provider\_archive) | ~> 2.2 |
| <a name="provider_aws"></a> [aws](#provider\_aws) | ~> 4.20 |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [aws_cloudwatch_log_group.lambda_cw_log_group](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_log_group) | resource |
| [aws_iam_policy.lambda_cw_logs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy) | resource |
| [aws_iam_policy_attachment.lambda_cw_logs_attachment](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy_attachment) | resource |
| [aws_iam_role.lambda_role](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role) | resource |
| [aws_iam_role_policy_attachment.lambda_vpc_access_execution](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_kms_alias.cw](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/kms_alias) | resource |
| [aws_kms_key.cw](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/kms_key) | resource |
| [aws_lambda_function.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function) | resource |
| [aws_lambda_layer_version.dependency_layer](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_layer_version) | resource |
| [archive_file.function_archive](https://registry.terraform.io/providers/hashicorp/archive/latest/docs/data-sources/file) | data source |
| [archive_file.layer_archive](https://registry.terraform.io/providers/hashicorp/archive/latest/docs/data-sources/file) | data source |
| [aws_caller_identity.current_caller](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/caller_identity) | data source |
| [aws_iam_policy_document.cw_kms_key](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_iam_policy_document.lambda_assume_role_document](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_iam_policy_document.lambda_cw_logs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_custom_vars"></a> [custom\_vars](#input\_custom\_vars) | Custom environment variables for the lambda function | `map(any)` | `{}` | no |
| <a name="input_environment"></a> [environment](#input\_environment) | Name of the environment. | `string` | n/a | yes |
| <a name="input_kms_key_admin_arns"></a> [kms\_key\_admin\_arns](#input\_kms\_key\_admin\_arns) | Additional IAM roles to map to the KMS key policy for administering the KMS key used for SSE. | `list(string)` | `[]` | no |
| <a name="input_kms_key_deletion_window_in_days"></a> [kms\_key\_deletion\_window\_in\_days](#input\_kms\_key\_deletion\_window\_in\_days) | Deletion window for KMS key in days. | `number` | `10` | no |
| <a name="input_lambda_cw_log_group_retention_in_days"></a> [lambda\_cw\_log\_group\_retention\_in\_days](#input\_lambda\_cw\_log\_group\_retention\_in\_days) | CloudWatch log group retention in days. | `number` | `30` | no |
| <a name="input_lambda_function_archive_output_path"></a> [lambda\_function\_archive\_output\_path](#input\_lambda\_function\_archive\_output\_path) | The output of the archive file. Default is {path.module}/dist/function.zip unless overridden. | `string` | `null` | no |
| <a name="input_lambda_function_archive_source_dir"></a> [lambda\_function\_archive\_source\_dir](#input\_lambda\_function\_archive\_source\_dir) | Package entire contents of this directory into the archive. Default is {path.module}/dist/src unless overridden. | `string` | `null` | no |
| <a name="input_lambda_function_archive_type"></a> [lambda\_function\_archive\_type](#input\_lambda\_function\_archive\_type) | The type of archive to generate. | `string` | `"zip"` | no |
| <a name="input_lambda_handler"></a> [lambda\_handler](#input\_lambda\_handler) | Function entrypoint in your code. For more information see https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-awscli.html | `string` | `"index.handler"` | no |
| <a name="input_lambda_layer_archive_output_path"></a> [lambda\_layer\_archive\_output\_path](#input\_lambda\_layer\_archive\_output\_path) | The output of the archive file. Default is {path.module}/dist/layers.zip unless overridden. | `string` | `null` | no |
| <a name="input_lambda_layer_archive_source_dir"></a> [lambda\_layer\_archive\_source\_dir](#input\_lambda\_layer\_archive\_source\_dir) | Package entire contents of this directory into the archive. Default is {path.module}/dist/layers unless overridden. | `string` | `null` | no |
| <a name="input_lambda_layer_archive_type"></a> [lambda\_layer\_archive\_type](#input\_lambda\_layer\_archive\_type) | The type of archive to generate. | `string` | `"zip"` | no |
| <a name="input_lambda_memory"></a> [lambda\_memory](#input\_lambda\_memory) | Lambda memory in MB. | `number` | n/a | yes |
| <a name="input_lambda_name"></a> [lambda\_name](#input\_lambda\_name) | Name of the lambda | `string` | `"lambda-boilerplate"` | no |
| <a name="input_lambda_runtime"></a> [lambda\_runtime](#input\_lambda\_runtime) | Lambda runtime | `string` | n/a | yes |
| <a name="input_lambda_timeout"></a> [lambda\_timeout](#input\_lambda\_timeout) | Lambda timeout in seconds. | `number` | n/a | yes |
| <a name="input_region"></a> [region](#input\_region) | AWS region | `string` | n/a | yes |
| <a name="input_tags"></a> [tags](#input\_tags) | Set of tags to apply to resources | `map(string)` | n/a | yes |
| <a name="input_vpc_config"></a> [vpc\_config](#input\_vpc\_config) | Optional VPC Configurations params | `map(any)` | `null` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_lambda_arn"></a> [lambda\_arn](#output\_lambda\_arn) | n/a |
| <a name="output_lambda_function_name"></a> [lambda\_function\_name](#output\_lambda\_function\_name) | n/a |
| <a name="output_lambda_role_arn"></a> [lambda\_role\_arn](#output\_lambda\_role\_arn) | n/a |
| <a name="output_lambda_role_name"></a> [lambda\_role\_name](#output\_lambda\_role\_name) | n/a |
| <a name="output_lambda_version"></a> [lambda\_version](#output\_lambda\_version) | n/a |
<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
