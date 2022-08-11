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

##Random-UUID
resource "random_id" "this" {
  byte_length = 8
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
  region      = var.region

  lambda_runtime = var.lambda_runtime
  lambda_handler = "index.handler"
  lambda_memory  = 128
  lambda_timeout = 120

  lambda_function_archive_source_dir  = "${path.root}/dist/src"
  lambda_function_archive_output_path = "${path.root}/dist/function.zip"
  lambda_layer_archive_source_dir     = "${path.root}/dist/layers"
  lambda_layer_archive_output_path    = "${path.root}/dist/layers.zip"

  kms_key_admin_arns = var.kms_key_admin_arns
  vpc_config         = var.vpc_config
  tags               = module.tags.tags
}

module "sns" {
  source         = "./lambda"
  environment    = var.environment
  region         = var.region
  lambda_name    = local.sns_lambda_name
  lambda_runtime = var.lambda_runtime
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
  region         = var.region
  lambda_name    = local.sqs_lambda_name
  lambda_runtime = var.lambda_runtime
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
resource "aws_sns_topic" "this" {
  name = var.sns_topic_name

  tags = module.tags.tags
}

resource "aws_sns_topic_subscription" "topic_lambda" {
  topic_arn = aws_sns_topic.this.arn
  protocol  = "lambda"
  endpoint  = module.sns.lambda_arn
}

resource "aws_lambda_permission" "with_sns" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = module.sns.lambda_function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.this.arn
}

################################################################################
## sqs
################################################################################
resource "aws_sqs_queue" "results_updates" {
  name = var.sqs_results_updates

  redrive_policy = jsonencode(
    {
      "deadLetterTargetArn" : aws_sqs_queue.results_updates_dl_queue.arn,
      "maxReceiveCount" : 5
    }
  )
  visibility_timeout_seconds = 300
  delay_seconds              = 90
  max_message_size           = 2048
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 10

  tags = module.tags.tags
}

resource "aws_sqs_queue" "results_updates_dl_queue" {
  name = var.sqs_results_updates_dlq

  tags = module.tags.tags
}

data "aws_iam_policy_document" "sqs" {
  version = "2012-10-17"

  statement {
    effect = "Allow"

    actions = [
      "sqs:ChangeMessageVisibility",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:ReceiveMessage"
    ]

    resources = [
      aws_sqs_queue.results_updates.arn
    ]
  }
}

resource "aws_iam_policy" "sqs" {
  policy = data.aws_iam_policy_document.sqs.json

  tags = module.tags.tags
}

resource "aws_iam_role_policy_attachment" "lambda_sqs" {
  role       = module.sqs.lambda_role_name
  policy_arn = aws_iam_policy.sqs.arn
}

resource "aws_lambda_event_source_mapping" "event_source_mapping" {
  event_source_arn = aws_sqs_queue.results_updates.arn
  enabled          = var.lambda_event_source_mapping_enabled
  function_name    = module.sqs.lambda_function_name
  batch_size       = var.lambda_event_source_mapping_batch_size
}
