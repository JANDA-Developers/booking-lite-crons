variable "region" {
  type        = string
  default     = "ap-northeast-2"
  description = "AWS Region"
}

variable "environment" {
  type        = string
  description = "Application environment"
}

variable "vpc_id" {
  type        = string
  description = "Network for install application"
}

variable "subnet_ids" {
  type = list(string)
}

variable "layer_file_name" {
  type        = string
  description = "File name for AWS Lambda nodejs layer"
}

variable "account_id" {
  type = string
}