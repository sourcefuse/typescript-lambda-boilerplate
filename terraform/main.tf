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

  environment    = var.environment
  lambda_memory  = 128
  lambda_runtime = "nodejs14.x"
  lambda_timeout = 120
  region         = "us-east-1"

  tags = module.tags.tags
}
