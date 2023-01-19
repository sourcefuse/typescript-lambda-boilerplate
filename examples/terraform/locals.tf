locals {
  redis_endpoint = var.custom_redis_endpoint != null ? var.custom_redis_endpoint : "redis://${try(module.redis[0].endpoint, "")}:${try(module.redis[0].port, "")}"
  //kms_key_admin_arns = ["arn:aws:iam::${data.aws_caller_identity.current_caller.account_id}:root"])
}
