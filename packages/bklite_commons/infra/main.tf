resource "aws_lambda_layer_version" "bklite_backend_layer" {
  layer_name = "bklite_backend"
  filename   = file("${path.module}/../app/dist.zip")

  compatible_runtimes = ["nodejs14.x"]
}
