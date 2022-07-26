################################################################################
## defaults
################################################################################
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.20.1"
    }
  }
}

## providers
provider "aws" {
  region  = var.region
  profile = var.profile
}

################################################################################
## tags
################################################################################
module "tags" {
  source = "git::https://github.com/sourcefuse/terraform-aws-refarch-tags?ref=1.0.1"

  environment = var.environment
  project     = "typescript-lambda-boilerplate"
}

################################################################################
## lambda
################################################################################
module "boilerplate" {
  source = "./lambda"

  environment = var.environment
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

  tags = module.tags.tags
}
