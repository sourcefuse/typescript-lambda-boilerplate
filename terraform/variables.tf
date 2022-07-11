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
