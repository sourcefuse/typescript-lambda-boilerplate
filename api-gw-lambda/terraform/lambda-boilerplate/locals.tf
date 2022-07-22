locals {
  cw_kms_alias = "alias/${var.lambda_name}/cw"

  kms_key_admin_arns = concat([
    data.aws_caller_identity.current_caller.arn
  ], var.kms_key_admin_arns)
}
