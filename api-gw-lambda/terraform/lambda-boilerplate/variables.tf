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
