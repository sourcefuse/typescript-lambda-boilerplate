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
module "lambda" {
  source = "./lambda-boilerplate"

  environment = var.environment
  region      = "us-east-1"

  lambda_runtime = "nodejs16.x"
  lambda_memory  = 128
  lambda_timeout = 120

  kms_key_admin_arns = var.kms_key_admin_arns

  tags = module.tags.tags
}
