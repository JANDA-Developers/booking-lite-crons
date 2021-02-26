output "lambda_layer_arn" {
  value = aws_lambda_layer_version.bklite_backend_layer.arn
}

output "lambda_layer_version" {
  value = aws_lambda_layer_version.bklite_backend_layer.version
}
