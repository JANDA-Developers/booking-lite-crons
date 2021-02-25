provider "aws" {
  region = var.region
}

terraform {
  required_version = ">=0.14.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">=3.28.0"
    }
  }
  backend "s3" {}
}

module "common_layer" {
  source = "./packages/@janda-bklite-models/infra"

  environment = var.environment
}

module "product_automator" {
  source = "./services/product_automator/infra"

  environment           = var.environment
  region                = var.region
  vpc_id                = var.vpc_id
  subnet_ids            = var.subnet_ids
  lambda_layer_arn_list = [module.common_layer.lambda_layer_arn]
}
