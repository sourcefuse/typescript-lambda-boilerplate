variable "namespace" {
  description = "Namespace for the resources."
  type        = string
  default     = "refarch-devops"
}

variable "environment" {
  type        = string
  default     = "dev"
  description = "ID element. Usually used for region e.g. 'uw2', 'us-west-2', OR role 'prod', 'staging', 'dev', 'UAT'"
}
