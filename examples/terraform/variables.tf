variable "namespace" {
  description = "Namespace for the resources."
  type        = string
  default     = "refarchdevops"
}

variable "environment" {
  type        = string
  default     = "dev"
  description = "ID element. Usually used for region e.g. 'uw2', 'us-west-2', OR role 'prod', 'staging', 'dev', 'UAT'"
}

variable "region" {
  type = string
  default = "us-east-1"
  description = "Name of the region resources will be created in."  
}

variable "profile" {
  type        = string
  description = "Name of the AWS Profile configured on your workstation."
}

variable "redis_endpoint" {
  type        = string
  default     = ""
  description = "Redis endpoint to be set in the lambda environment variable"
}