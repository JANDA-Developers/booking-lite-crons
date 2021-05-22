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
    Name        = "${var.env_prod}-iam-for-lambda"
    Environment = var.env_prod
  }
}

resource "aws_iam_role" "iam_for_lambda_dev" {
  name               = "iam_for_invoke_lambda_${var.env_dev}"
  assume_role_policy = data.aws_iam_policy_document.policy_for_cloudwatch_logs.json

  tags = {
    Name        = "${var.env_dev}-iam-for-lambda"
    Environment = var.env_dev
  }
}



# Package! Booking Lite Backend 모델 & Util 함수 담겨있음. node_modules 정도로 생각하면됨!
module "common_layer" {
  source = "./packages/bklite_commons/infra"

  layer_name      = "bklite-model-${var.env_prod}"
  environment     = var.env_dev
  layer_file_name = var.layer_file_name
}

module "common_layer_dev" {
  source = "./packages/bklite_commons/infra"

  layer_name      = "bklite-model-${var.env_dev}"
  environment     = var.env_dev
  layer_file_name = var.layer_file_name
}

module "product_automator" {
  source     = "./services/product_automator/infra"
  depends_on = [aws_iam_role.iam_for_lambda, module.common_layer]

  environment           = var.env_prod
  region                = var.region
  vpc_id                = var.vpc_id
  subnet_ids            = var.subnet_ids
  lambda_layer_arn_list = [module.common_layer.lambda_layer_arn]
  env_db_uri            = var.env_db_uri
  lambda_iam_arn        = aws_iam_role.iam_for_lambda.arn
}

module "product_automator_dev" {
  source     = "./services/product_automator/infra"
  depends_on = [aws_iam_role.iam_for_lambda_dev, module.common_layer_dev]

  environment           = var.env_dev
  region                = var.region
  vpc_id                = var.vpc_id_dev
  subnet_ids            = var.subnet_ids_dev
  lambda_layer_arn_list = [module.common_layer_dev.lambda_layer_arn]
  env_db_uri            = var.env_db_uri_dev
  lambda_iam_arn        = aws_iam_role.iam_for_lambda_dev.arn
}

module "calculate_settlement" {
  source     = "./services/calculate_settlement/infra"
  depends_on = [aws_iam_role.iam_for_lambda, module.common_layer]

  environment           = var.environment
  region                = var.region
  vpc_id                = var.vpc_id
  subnet_ids            = var.subnet_ids
  lambda_layer_arn_list = [module.common_layer.lambda_layer_arn]
  env_db_uri            = var.env_db_uri
  lambda_iam_arn        = aws_iam_role.iam_for_lambda.arn
}


module "calculate_settlement_dev" {
  source     = "./services/calculate_settlement/infra"
  depends_on = [aws_iam_role.iam_for_lambda_dev, module.common_layer_dev]

  environment           = var.env_dev
  region                = var.region
  vpc_id                = var.vpc_id_dev
  subnet_ids            = var.subnet_ids_dev
  lambda_layer_arn_list = [module.common_layer_dev.lambda_layer_arn]
  env_db_uri            = var.env_db_uri_dev
  lambda_iam_arn        = aws_iam_role.iam_for_lambda_dev.arn
}