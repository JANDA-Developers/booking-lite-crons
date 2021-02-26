variable "region" {}

variable "environment" {}

variable "vpc_id" {}

variable "subnet_ids" {}

variable "handler_name" {
  type    = string
  default = "index.handler"
}

variable "lambda_layer_arn_list" {
  type = list(string)
}
