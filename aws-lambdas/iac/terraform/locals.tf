locals {

  sns_lambda_name       = "sns-boilerplate-${random_pet.this.id}"
  sqs_lambda_name       = "sqs-boilerplate-${random_pet.this.id}"
  sns_kms_master_key_id = var.sns_kms_master_key_id == null ? "alias/aws/sns" : var.sns_kms_master_key_id
  kms_master_key_id     = var.kms_master_key_id_override == null ? "alias/aws/sqs" : var.kms_master_key_id_override

}
