locals {
  private_subnet_cidr = [for s in data.aws_subnet.subnet : s.cidr_block]
  kms_key_admin_arns  = ["arn:aws:iam::${data.aws_caller_identity.current_caller.account_id}:root"]
  ec_subnet_ids       = [for s in data.aws_subnet.subnet : s.id]
}
