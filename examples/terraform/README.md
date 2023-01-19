# Terraform: Lambda Boilerplate example

See the [README](../../../../README.md) in the repo's root for more information.  


<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | ~>1.3 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | ~>4.20 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | 4.20.1 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_integration_test_infra"></a> [integration\_test\_infra](#module\_integration\_test\_infra) | ../../aws-lambdas/iac/terraform | n/a |

## Resources

| Name | Type |
|------|------|
| [aws_security_group.ec_lambda_security_group](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group) | resource |
| [aws_caller_identity.current_caller](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/caller_identity) | data source |
| [aws_subnet.subnet](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/subnet) | data source |
| [aws_subnets.private](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/subnets) | data source |
| [aws_vpc.vpc](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/vpc) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_environment"></a> [environment](#input\_environment) | ID element. Usually used for region e.g. 'uw2', 'us-west-2', OR role 'prod', 'staging', 'dev', 'UAT' | `string` | `"dev"` | no |
| <a name="input_namespace"></a> [namespace](#input\_namespace) | Namespace for the resources. | `string` | `"refarchdevops"` | no |
| <a name="input_profile"></a> [profile](#input\_profile) | Name of the AWS Profile configured on your workstation. | `string` | n/a | yes |
| <a name="input_redis_endpoint"></a> [redis\_endpoint](#input\_redis\_endpoint) | Redis endpoint to be set in the lambda environment variable | `string` | `""` | no |
| <a name="input_region"></a> [region](#input\_region) | Name of the region resources will be created in. | `string` | `"us-east-1"` | no |

## Outputs

No outputs.
<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
