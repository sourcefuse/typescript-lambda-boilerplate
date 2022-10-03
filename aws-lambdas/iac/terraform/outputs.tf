output "lambda_boilerplate_arn" {
  value = module.boilerplate.lambda_arn
}

output "lambda_boilerplate_name" {
  value = module.boilerplate.lambda_function_name
}

output "lambda_boilerplate_version" {
  value = module.boilerplate.lambda_version
}


output "lambda_sns_arn" {
  value = module.sns.lambda_arn
}

output "lambda_sns_name" {
  value = module.sns.lambda_function_name
}

output "lambda_sns_version" {
  value = module.sns.lambda_version
}

output "lambda_sqs_arn" {
  value = module.sqs.lambda_arn
}

output "lambda_sqs_name" {
  value = module.sqs.lambda_function_name
}

output "lambda_sqs_version" {
  value = module.sqs.lambda_version
}

