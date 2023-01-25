data "aws_caller_identity" "current_caller" {}

data "aws_vpc" "vpc" {
  filter {
    name   = "tag:Name"
    values = ["${var.namespace}-${var.environment}-vpc"]
  }
}
data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.vpc.id]
  }
  filter {
    name = "tag:Name"

    values = [
      "${var.namespace}-${var.environment}-privatesubnet-private-${var.region}a",
      "${var.namespace}-${var.environment}-privatesubnet-private-${var.region}b"
    ]
  }
}

data "aws_subnet" "subnet" {
  for_each = toset(data.aws_subnets.private.ids)
  id       = each.value
}
