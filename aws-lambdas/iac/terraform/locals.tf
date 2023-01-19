locals {

  sns_lambda_name       = "sns-boilerplate-${random_pet.this.id}"
  sqs_lambda_name       = "sqs-boilerplate-${random_pet.this.id}"
  cron_lambda_name      = "cron-boilerplate-${random_pet.this.id}"
  cron_lambda_schedule  = var.cron_lambda_schedule == null ? "rate(1 day)" : var.cron_lambda_schedule
  sns_kms_master_key_id = var.sns_kms_master_key_id == null ? "alias/aws/sns" : var.sns_kms_master_key_id
  kms_master_key_id     = var.kms_master_key_id_override == null ? "alias/aws/sqs" : var.kms_master_key_id_override

}
