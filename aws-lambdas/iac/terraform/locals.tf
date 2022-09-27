locals {
  sns_lambda_name   = "sns-boilerplate-${random_pet.this.id}"
  sqs_lambda_name   = "sqs-boilerplate-${random_pet.this.id}"
  kms_master_key_id = var.kms_master_key_id_override == null ? "alias/aws/sqs" : var.kms_master_key_id_override
}
