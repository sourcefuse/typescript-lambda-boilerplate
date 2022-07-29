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

################################################################################
## sns
################################################################################
variable "sns_topic_name" {
  description = "Name to assign the SNS Topic."
  type        = string
}

################################################################################
## sqs
################################################################################
variable "sqs_results_updates" {
  description = "Name to assign the SQS Results Updates Queue."
  type        = string
  default     = "results-updates-queue"
}
