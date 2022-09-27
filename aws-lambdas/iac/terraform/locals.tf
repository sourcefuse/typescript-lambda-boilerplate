locals {
  sns_lambda_name = "sns-boilerplate-${random_id.this.hex}"
  sqs_lambda_name = "sqs-boilerplate-${random_id.this.hex}"
  sns_kms_master_key_id = var.sns_kms_master_key_id == null ? "alias/aws/sns" : var.sns_kms_master_key_id
}
