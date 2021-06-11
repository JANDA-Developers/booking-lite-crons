provider "aws" {
  region = var.region
}

terraform {
  required_version = ">=0.14.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">=3.30.0"
    }
  }
  backend "s3" {}
}


# Package! Booking Lite Backend 모델 & Util 함수 담겨있음. node_modules 정도로 생각하면됨!
module "common_layer" {
  source = "./packages/bklite_commons/infra"

  environment     = var.environment
  layer_file_name = var.layer_file_name
}

# Setup lambda IAM policies.
data "aws_iam_policy_document" "policy_for_cloudwatch_logs" {
  version = "2012-10-17"
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      identifiers = ["lambda.amazonaws.com"]
      type        = "Service"
    }
    effect = "Allow"
    sid    = ""
  }
}

resource "aws_iam_role" "iam_for_lambda" {
  name               = "iam_for_invoke_lambda"
  assume_role_policy = data.aws_iam_policy_document.policy_for_cloudwatch_logs.json

  tags = {
    Name        = "${var.environment}-iam-for-lambda"
    Environment = var.environment
  }
}

module "product_automator" {
  source = "./services/product_automator/infra"
  depends_on = [aws_iam_role.iam_for_lambda]

  environment           = var.environment
  region                = var.region
  vpc_id                = var.vpc_id
  subnet_ids            = var.subnet_ids
  lambda_layer_arn_list = [module.common_layer.lambda_layer_arn]
  env_db_uri            = var.env_db_uri
  lambda_iam_arn = aws_iam_role.iam_for_lambda.arn
}

module "calculate_settlement" {
  source = "./services/calculate_settlement/infra"
  depends_on = [aws_iam_role.iam_for_lambda]

  environment           = var.environment
  region                = var.region
  vpc_id                = var.vpc_id
  subnet_ids            = var.subnet_ids
  lambda_layer_arn_list = [module.common_layer.lambda_layer_arn]
  env_db_uri            = var.env_db_uri
  lambda_iam_arn = aws_iam_role.iam_for_lambda.arn
}


