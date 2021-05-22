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

variable "env_db_uri" {
  type        = string
  description = "Lambda DB URI"
}

variable "env_prod" {
  description = "This is the environment where your webapp is deployed. qa, prod, or dev"
}

variable "env_dev" {
  description = "This is the environment where your webapp is deployed. qa, prod, or dev"
}

variable "vpc_id_dev" {

}

variable "subnet_ids_dev" {

}

variable "layer_file_name_dev" {

}

variable "env_db_uri_dev" {

}