locals {
  sns_lambda_name                   = "sns-boilerplate-${random_id.this.hex}"
  sqs_lambda_name                   = "sqs-boilerplate-${random_id.this.hex}"
  kms_master_key_id                 = "alias/aws/sqs"
  kms_data_key_reuse_period_seconds = 300
}
