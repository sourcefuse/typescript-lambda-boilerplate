################################################################################
## shared
################################################################################
variable "environment" {
  description = "Name of the environment resources will be created in."
  type        = string
  default     = "dev"
}

variable "region" {
  description = "Name of the region resources will be created in."
  type        = string
  default     = "us-east-1"
}

variable "profile" {
  description = "Name of the AWS Profile configured on your workstation."
  type        = string
}

variable "kms_key_admin_arns" {
  description = "Additional IAM roles to map to the KMS key policy for administering the KMS key used for SSE."
  type        = list(string)
  default     = []
}

################################################################################
## lambda
################################################################################
variable "lambda_runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "nodejs16.x"
}

variable "lambda_sqs_policy_name" {
  description = "Name to assign the Lambda SQS Policy"
  type        = string
  default     = "lambda-sqs"
}

variable "lambda_event_source_mapping_enabled" {
  description = "Determines if the mapping will be enabled on creation."
  type        = bool
  default     = true
}

variable "lambda_event_source_mapping_batch_size" {
  description = "The largest number of records that Lambda will retrieve from your event source at the time of invocation. Defaults to 100 for DynamoDB, Kinesis, MQ and MSK, 10 for SQS."
  type        = number
  default     = 10
}

variable "vpc_config" {
  description = "Optional VPC Configurations params"
  type        = map(any)
  default     = null
}

################################################################################
## sns
################################################################################
variable "sns_topic_name" {
  description = "Name to assign the SNS Topic."
  type        = string
  default     = "sns-with-lambda"
}

################################################################################
## sqs
################################################################################
variable "sqs_results_updates" {
  description = "Name to assign the SQS Results Updates Queue."
  type        = string
  default     = "results-updates-queue"
}

variable "sqs_results_updates_dlq" {
  description = "Name to assign the SQS Results Updates Dead Letter Queue."
  type        = string
  default     = "results-updates-dl-queue"
}

variable "kms_master_key_id_override" {
  description = "KMS key id for sqs encryption"
  type        = string
  default     = null
}

variable "kms_data_key_reuse_period_seconds" {
  description = ""
  type        = number
  default     = 300
}
