locals {
  cw_kms_alias = "alias/${var.lambda_name}/cw"

  lambda_function_archive_source_dir  = var.lambda_function_archive_source_dir != null ? var.lambda_function_archive_source_dir : "${path.module}/dist/src/"
  lambda_function_archive_output_path = var.lambda_function_archive_output_path != null ? var.lambda_function_archive_output_path : "${path.module}/dist/function.zip"
  lambda_layer_archive_source_dir     = var.lambda_layer_archive_source_dir != null ? var.lambda_layer_archive_source_dir : "${path.module}/dist/layers"
  lambda_layer_archive_output_path    = var.lambda_layer_archive_output_path != null ? var.lambda_layer_archive_output_path : "${path.module}/dist/layers.zip"
  kms_key_admin_arns                  = var.kms_key_admin_arns
}
