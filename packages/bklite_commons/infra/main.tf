resource "aws_lambda_layer_version" "bklite_backend_layer" {
  layer_name = "bklite_backend"
  filename   = "${path.cwd}/${var.layer_file_name}"

  source_code_hash = filebase64sha256("${path.cwd}/${var.layer_file_name}")

  // TODO: EventBridge Cron 설정 ㄱㄱ

  compatible_runtimes = ["nodejs14.x", "nodejs12.x"]
}