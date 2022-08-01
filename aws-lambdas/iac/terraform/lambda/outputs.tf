output "lambda_arn" {
  value = aws_lambda_function.this.arn
}

output "lambda_version" {
  value = aws_lambda_function.this.version
}

output "lambda_function_name" {
  value = aws_lambda_function.this.function_name
}

output "lambda_role_name" {
  value = aws_iam_role.lambda_role.name
}

output "lambda_role_arn" {
  value = aws_iam_role.lambda_role.arn
}
