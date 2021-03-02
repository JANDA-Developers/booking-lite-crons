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

variable "lambda_variables" {
  type        = map(string)
  description = "Variables for aws lambda"
  default = {
    memory  = 512
    timeout = 840
  }
}

variable "env_db_uri" {
  type        = string
  description = "Env values for lambda"

}