locals {
  sns_lambda_name = "sns-boilerplate-${random_pet.this.id}"
  sqs_lambda_name = "sqs-boilerplate-${random_pet.this.id}"
}
