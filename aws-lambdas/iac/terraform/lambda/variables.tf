################################################################################
## shared
################################################################################
variable "environment" {
  description = "Name of the environment."
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "tags" {
  description = "Set of tags to apply to resources"
  type        = map(string)
}

################################################################################
## lambda
################################################################################
variable "lambda_function_archive_type" {
  description = "The type of archive to generate."
  type        = string
  default     = "zip"
}

variable "lambda_function_archive_source_dir" {
  description = "Package entire contents of this directory into the archive. Default is {path.module}/dist/src unless overridden."
  type        = string
  default     = null
}

variable "lambda_function_archive_output_path" {
  description = "The output of the archive file. Default is {path.module}/dist/function.zip unless overridden."
  type        = string
  default     = null
}

variable "lambda_layer_archive_type" {
  description = "The type of archive to generate."
  type        = string
  default     = "zip"
}

variable "lambda_layer_archive_source_dir" {
  description = "Package entire contents of this directory into the archive. Default is {path.module}/dist/layers unless overridden."
  type        = string
  default     = null
}

variable "lambda_layer_archive_output_path" {
  description = "The output of the archive file. Default is {path.module}/dist/layers.zip unless overridden."
  type        = string
  default     = null
}

variable "lambda_handler" {
  description = "Function entrypoint in your code. For more information see https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-awscli.html"
  type        = string
  default     = "index.handler"
}

variable "lambda_runtime" {
  description = "Lambda runtime"
  type        = string
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds."
  type        = number
}

variable "lambda_memory" {
  description = "Lambda memory in MB."
  type        = number
}

variable "lambda_name" {
  description = "Name of the lambda"
  type        = string
  default     = "lambda-boilerplate"
}

variable "vpc_config" {
  description = "Optional VPC Configurations params"
  type        = map(any)
  default     = null
}

################################################################################
## cloudwatch
################################################################################
variable "lambda_cw_log_group_retention_in_days" {
  description = "CloudWatch log group retention in days."
  type        = number
  default     = 30
}

################################################################################
## kms
################################################################################
variable "kms_key_admin_arns" {
  description = "Additional IAM roles to map to the KMS key policy for administering the KMS key used for SSE."
  type        = list(string)
  default     = []
}

variable "kms_key_deletion_window_in_days" {
  description = "Deletion window for KMS key in days."
  type        = number
  default     = 10
}
