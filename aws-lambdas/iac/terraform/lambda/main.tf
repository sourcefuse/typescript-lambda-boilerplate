terraform {
  required_version = "~> 1.3"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.20"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.2"
    }
  }
}

################################################################################
## lookups
################################################################################

data "archive_file" "function_archive" {
  type        = var.lambda_function_archive_type
  source_dir  = local.lambda_function_archive_source_dir
  output_path = local.lambda_function_archive_output_path
}

data "archive_file" "layer_archive" {
  type        = var.lambda_layer_archive_type
  source_dir  = local.lambda_layer_archive_source_dir
  output_path = local.lambda_layer_archive_output_path
}

################################################################################
## lambda
################################################################################
resource "aws_lambda_layer_version" "dependency_layer" {
  filename            = data.archive_file.layer_archive.output_path
  layer_name          = "${var.lambda_name}-dependency-layer"
  source_code_hash    = data.archive_file.layer_archive.output_base64sha256
  compatible_runtimes = [var.lambda_runtime]
}

resource "aws_lambda_function" "this" {
  filename         = data.archive_file.function_archive.output_path
  source_code_hash = data.archive_file.function_archive.output_base64sha256
  function_name    = var.lambda_name
  role             = aws_iam_role.lambda_role.arn
  handler          = var.lambda_handler
  runtime          = var.lambda_runtime
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory

  layers = [
    aws_lambda_layer_version.dependency_layer.arn
  ]

  environment {
    variables = merge(tomap({
      "ENVIRONMENT_NAME" = var.environment,
      "REGION"           = var.region
    }), var.custom_vars)
  }


  dynamic "vpc_config" {
    for_each = var.vpc_config == null ? [] : [var.vpc_config]
    content {
      subnet_ids         = vpc_config.value.subnet_ids
      security_group_ids = vpc_config.value.security_group_ids
    }
  }


  tags = var.tags
}

################################################################################
## iam
################################################################################
## cloudwatch kms
data "aws_iam_policy_document" "cw_kms_key" {
  version = "2012-10-17"

  statement {
    effect = "Allow"

    principals {
      identifiers = ["logs.${var.region}.amazonaws.com"]
      type        = "Service"
    }

    actions = [
      "kms:Decrypt*",
      "kms:Encrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey",
      "kms:RequestAlias",
      "kms:ReEncrypt*",
      "kms:ListAliases"
    ]

    resources = ["*"]

  }

  statement {
    effect = "Allow"

    principals {
      identifiers = local.kms_key_admin_arns
      type        = "AWS"
    }

    // * is required to avoid this error from the API - MalformedPolicyDocumentException: The new key policy will not allow you to update the key policy in the future.
    actions = [
      "kms:*"
    ]

    // * is required to avoid this error from the API - MalformedPolicyDocumentException: The new key policy will not allow you to update the key policy in the future.
    resources = ["*"]
  }
}

## lambda
data "aws_iam_policy_document" "lambda_assume_role_document" {
  version = "2012-10-17"

  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    effect = "Allow"
  }
}

## lambda cloudwatch
data "aws_iam_policy_document" "lambda_cw_logs" {
  version = "2012-10-17"

  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = [
      "${aws_cloudwatch_log_group.lambda_cw_log_group.arn}:*"
    ]
  }
}

resource "aws_iam_policy" "lambda_cw_logs" {
  name   = "${var.lambda_name}-cw-logs"
  policy = data.aws_iam_policy_document.lambda_cw_logs.json
}

resource "aws_iam_role" "lambda_role" {
  name               = "${substr(var.lambda_name, 0, 58)}-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_document.json

  tags = var.tags
}

resource "aws_iam_policy_attachment" "lambda_cw_logs_attachment" {
  name       = "${var.lambda_name}-cw-logs-attachment"
  policy_arn = aws_iam_policy.lambda_cw_logs.arn

  roles = [
    aws_iam_role.lambda_role.name,
  ]
}


resource "aws_iam_role_policy_attachment" "lambda_vpc_access_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

################################################################################
## cloudwatch
################################################################################
resource "aws_cloudwatch_log_group" "lambda_cw_log_group" {
  name              = "/aws/lambda/${var.lambda_name}"
  retention_in_days = var.lambda_cw_log_group_retention_in_days
  kms_key_id        = aws_kms_key.cw.arn

  lifecycle {
    create_before_destroy = false
  }

  tags = var.tags
}


################################################################################
## kms
################################################################################
resource "aws_kms_key" "cw" {
  description             = "KMS key used for CloudWatch log encryption"
  deletion_window_in_days = var.kms_key_deletion_window_in_days
  policy                  = data.aws_iam_policy_document.cw_kms_key.json
  enable_key_rotation     = true
}

resource "aws_kms_alias" "cw" {
  name          = local.cw_kms_alias
  target_key_id = aws_kms_key.cw.id
}
