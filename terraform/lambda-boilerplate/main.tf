################################################################################
## lookups
################################################################################
data "aws_caller_identity" "current_caller" {}

data "archive_file" "function_archive" {
  type        = "zip"
  source_dir  = "${path.module}/dist/src/"
  output_path = "${path.module}/dist/function.zip"
}

data "archive_file" "layer_archive" {
  type        = "zip"
  source_dir  = "${path.module}/dist/layers"
  output_path = "${path.module}/dist/layers.zip"
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
  handler          = "index.handler"
  runtime          = var.lambda_runtime
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory

  layers = [
    aws_lambda_layer_version.dependency_layer.arn
  ]

  environment {
    variables = {
      ENVIRONMENT_NAME = var.environment
      REGION           = var.region
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
