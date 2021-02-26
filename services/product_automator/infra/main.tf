resource "aws_iam_role" "iam_for_lambda" {
  name               = "iam_for_lambda"
  assume_role_policy = file("${path.module}/iam/iam_for_lambda.json")
}

resource "aws_lambda_function" "lambda" {
  function_name = "${var.environment}-product-create-cron"
  handler       = var.handler_name
  role          = aws_iam_role.iam_for_lambda.arn
  runtime       = "nodejs14.x"
  filename      = "${path.module}/dist.zip"

  layers = var.lambda_layer_arn_list

  source_code_hash = filebase64sha256("${path.module}/dist.zip")
}
