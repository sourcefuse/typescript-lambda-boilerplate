module "integration_test_infra" {
  source                = "../../aws-lambdas/iac/terraform"
  profile               = var.profile
  environment           = var.environment
  region                = var.region
  ec_subnet_ids         = local.ec_subnet_ids
  ec_security_group_ids = [aws_security_group.ec_lambda_security_group.id]
  redis_endpoint        = var.redis_endpoint
  kms_key_admin_arns    = local.kms_key_admin_arns
}

resource "aws_security_group" "ec_lambda_security_group" {
  name        = "${var.namespace}-${var.environment}-lambda-elasticache"
  description = "Lambda VPC Security Group for ElastiCache example"
  vpc_id      = data.aws_vpc.vpc.id

  egress {
    from_port   = 0
    to_port     = 6379
    protocol    = "TCP"
    cidr_blocks = local.private_subnet_cidr
  }
  tags = {
    Name       = "${var.namespace}-${var.environment}-lambda-elasticache"
    redis-user = "yes"
  }
}
