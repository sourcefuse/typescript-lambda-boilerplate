################################################################################
## defaults
################################################################################
terraform {
  required_version = ">= 1.0.8"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.20.1"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.3.2"
    }
  }
}

## providers
provider "aws" {
  region  = var.region
  profile = var.profile
}

##Random-PET
resource "random_pet" "this" {
  length = 2
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
  tags               = module.tags.extra_tags
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

  tags = module.tags.extra_tags
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

  tags = module.tags.extra_tags
}

module "cron" {
  source         = "./lambda"
  environment    = var.environment
  region         = var.region
  lambda_name    = local.cron_lambda_name
  lambda_runtime = var.lambda_runtime
  lambda_handler = "cron.handler"
  lambda_memory  = 128
  lambda_timeout = 120

  lambda_function_archive_source_dir  = "${path.root}/dist/src"
  lambda_function_archive_output_path = "${path.root}/dist/function.zip"
  lambda_layer_archive_source_dir     = "${path.root}/dist/layers"
  lambda_layer_archive_output_path    = "${path.root}/dist/layers.zip"

  kms_key_admin_arns = var.kms_key_admin_arns

  tags = module.tags.extra_tags
}

module "elasticache_redis" {
  source         = "./lambda"
  environment    = var.environment
  region         = var.region
  lambda_name    = local.ec_lambda_name
  lambda_runtime = var.lambda_runtime
  lambda_handler = "ec-redis.handler"
  lambda_memory  = 128
  lambda_timeout = 120

  lambda_function_archive_source_dir  = "${path.root}/dist/src"
  lambda_function_archive_output_path = "${path.root}/dist/function.zip"
  lambda_layer_archive_source_dir     = "${path.root}/dist/layers"
  lambda_layer_archive_output_path    = "${path.root}/dist/layers.zip"

  kms_key_admin_arns = var.kms_key_admin_arns
  vpc_config         = local.lambda_ec_vpc_config

  tags = module.tags.extra_tags

  custom_vars = tomap({
    "REDIS_ENDPOINT" = var.redis_endpoint
  })
}

################################################################################
## sns
################################################################################
resource "aws_sns_topic" "this" {
  name              = var.sns_topic_name
  tags              = module.tags.tags
  kms_master_key_id = local.sns_kms_master_key_id
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

  tags                              = module.tags.tags
  kms_master_key_id                 = local.kms_master_key_id
  kms_data_key_reuse_period_seconds = var.kms_data_key_reuse_period_seconds

}

resource "aws_sqs_queue" "results_updates_dl_queue" {
  name                              = var.sqs_results_updates_dlq
  tags                              = module.tags.tags
  kms_master_key_id                 = local.kms_master_key_id
  kms_data_key_reuse_period_seconds = var.kms_data_key_reuse_period_seconds
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
  name   = var.lambda_sqs_policy_name
  policy = data.aws_iam_policy_document.sqs.json
  tags   = module.tags.tags
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

resource "aws_iam_policy" "Policy-for-all-resources" {
  name = "admin_policy"
  # Policy for all resources used in lambda boilerplate
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "sns:*"
        ],
        Resource = "${aws_sns_topic.this.arn}:*"
      },
      {
        Effect = "Allow",
        Action = [
          "sqs:ChangeMessageVisibility",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:ReceiveMessage"
        ],
        Resource = "${aws_sqs_queue.results_updates.arn}:*"
      },
      {
        Effect = "Allow"
        Action = [
          "kms:*"
        ],
        Resource = ["${aws_sns_topic.this.arn}:*",
          "${aws_sqs_queue.results_updates.arn}:*"
        ]
      },
      # lambda-vpc-execution-role
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface",
          "ec2:AssignPrivateIpAddresses",
          "ec2:UnassignPrivateIpAddresses"
        ],

        Resource = "*" //NOSONAR

      },
    ]
  })
}

resource "aws_iam_role" "lambda_role" {
  name = "lambda_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_policy_attachment" "lambda_policy_role" {
  name       = "lambda_attachment"
  roles      = [aws_iam_role.lambda_role.name]
  policy_arn = aws_iam_policy.Policy-for-all-resources.arn
}


################################################################################
## cron
################################################################################

resource "aws_cloudwatch_event_rule" "lambda_cron" {
  name                = "${local.cron_lambda_name}-cron"
  schedule_expression = local.cron_lambda_schedule
}

resource "aws_lambda_permission" "allow_cloudwatch_to_invoke" {
  function_name = module.cron.lambda_function_name
  statement_id  = "CloudWatchInvoke"
  action        = "lambda:InvokeFunction"

  source_arn = aws_cloudwatch_event_rule.lambda_cron.arn
  principal  = "events.amazonaws.com"
}

resource "aws_cloudwatch_event_target" "invoke_lambda" {
  rule = aws_cloudwatch_event_rule.lambda_cron.name
  arn  = module.cron.lambda_arn
}
