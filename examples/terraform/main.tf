module "integration_test_infra" {
  source               = "../../aws-lambdas/iac/terraform"
  ec_subnet_ids        = data.aws_subnets.private.ids
  ec_security_group_ids = [aws_security_group.ec_lambda_security_group.id]
}

resource "aws_security_group" "ec_lambda_security_group" {
  name        = "lambda_elasticacahe_security_group"
  description = "lambda vpc security group for elastiache example"
  vpc_id      = data.aws_vpc.vpc.id

  dynamic "egress" {
    for_each = data.aws_subnets.cidr_blocks
    egress {
      from_port   = 0
      to_port     = 6379
      cidr_blocks = egress.value
    }
  }
}