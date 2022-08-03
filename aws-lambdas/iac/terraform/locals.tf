locals {
  sns_lambda_name = "sns-boilerplate-${random_id.this.hex}"
  sqs_lambda_name = "sqs-boilerplate-${random_id.this.hex}"
}
