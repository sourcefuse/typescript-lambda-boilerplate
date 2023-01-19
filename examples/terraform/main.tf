module "integration_test_infra" {
  source                = "../../aws-lambdas/iac/terraform"
  profile               = var.profile
  environment           = var.environment
  region                = var.region
  ec_subnet_ids         = [for s in data.aws_subnet.subnet : s.id]
  ec_security_group_ids = [aws_security_group.ec_lambda_security_group.id]
  redis_endpoint        = var.redis_endpoint
  kms_key_admin_arns    = ["arn:aws:iam::${data.aws_caller_identity.current_caller.account_id}:root"]
}

resource "aws_security_group" "ec_lambda_security_group" {
  name        = "lambda_elasticacahe_security_group"
  description = "lambda vpc security group for elastiache example"
  vpc_id      = data.aws_vpc.vpc.id

  egress {
    from_port   = 0
    to_port     = 6379
    protocol    = "TCP"
    cidr_blocks = local.private_subnet_cidr
  }
  tags = {
    Name       = "lambda_elasticache_security_group"
    redis-user = "yes"
  }
}
