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

module "sns" {
  source         = "./lambda"
  environment    = var.environment
  region         = "us-east-1"
  lambda_name    = "sns-boilerplate"
  lambda_runtime = "nodejs16.x"
  lambda_handler = "sns.handler"
  lambda_memory  = 128
  lambda_timeout = 120

  lambda_function_archive_source_dir  = "${path.root}/dist/src"
  lambda_function_archive_output_path = "${path.root}/dist/function.zip"
  lambda_layer_archive_source_dir     = "${path.root}/dist/layers"
  lambda_layer_archive_output_path    = "${path.root}/dist/layers.zip"

  kms_key_admin_arns = var.kms_key_admin_arns

  tags = module.tags.tags
}

module "sqs" {
  source         = "./lambda"
  environment    = var.environment
  region         = "us-east-1"
  lambda_name    = "sqs-boilerplate"
  lambda_runtime = "nodejs16.x"
  lambda_handler = "sqs.handler"
  lambda_memory  = 128
  lambda_timeout = 120

  lambda_function_archive_source_dir  = "${path.root}/dist/src"
  lambda_function_archive_output_path = "${path.root}/dist/function.zip"
  lambda_layer_archive_source_dir     = "${path.root}/dist/layers"
  lambda_layer_archive_output_path    = "${path.root}/dist/layers.zip"

  kms_key_admin_arns = var.kms_key_admin_arns

  tags = module.tags.tags
}

################################################################################
## sns
################################################################################
resource "aws_sns_topic" "topic" {
  name = var.sns-topic

  tags = module.tags.tags
}

resource "aws_sns_topic_subscription" "topic_lambda" {
  topic_arn = aws_sns_topic.topic.arn
  protocol  = "lambda"
  endpoint  = module.sns.lambda_arn
}

resource "aws_lambda_permission" "with_sns" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = module.sns.lambda_function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.topic.arn
}

################################################################################
## sqs
################################################################################
resource "aws_sqs_queue" "results_updates_queue" {
  name                       = "results-updates-queue"
  redrive_policy             = "{\"deadLetterTargetArn\":\"${aws_sqs_queue.results_updates_dl_queue.arn}\",\"maxReceiveCount\":5}"
  visibility_timeout_seconds = 300
  delay_seconds              = 90
  max_message_size           = 2048
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10

  tags = module.tags.tags
}

resource "aws_sqs_queue" "results_updates_dl_queue" {
  name = "results-updates-dl-queue"

  tags = module.tags.tags
}

resource "aws_iam_role_policy" "lambda_role_sqs_policy" {
  name   = "lambda-sqs"
  role   = module.sqs.lambda_role_name
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "sqs:ChangeMessageVisibility",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes",
        "sqs:ReceiveMessage"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_lambda_event_source_mapping" "event_source_mapping" {
  event_source_arn = aws_sqs_queue.results_updates_queue.arn
  enabled          = true
  function_name    = module.sqs.lambda_function_name
  batch_size       = 10
}
