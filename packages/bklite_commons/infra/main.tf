resource "aws_s3_bucket" "layer_store_bucket" {
  bucket = var.layer_s3_bucket_name
  acl    = "private"

  tags = {
    Name        = var.layer_s3_bucket_name
    Environment = var.environment
  }
}

resource "aws_lambda_layer_version" "bklite_backend_layer" {
  layer_name       = "bklite_backend"
  filename         = "${path.cwd}/${var.layer_file_name}"

  compatible_runtimes = ["nodejs14.x", "nodejs12.x"]
}
