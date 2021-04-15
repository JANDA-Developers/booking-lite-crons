resource "aws_lambda_function" "lambda" {
  function_name = "${var.environment}-calculate-settlement-amount"
  handler       = var.handler_name
  role          = var.lambda_iam_arn
  runtime       = "nodejs14.x"
  filename      = "${path.module}/dist.zip"
  timeout       = var.lambda_variables.timeout
  memory_size   = var.lambda_variables.memory

  layers = var.lambda_layer_arn_list

  source_code_hash = filebase64sha256("${path.module}/dist.zip")

  environment {
    variables = {
      DB_URI = var.env_db_uri
    }
  }
}

resource "aws_cloudwatch_event_rule" "every_3min" {
  name                = "every3min"
  description         = "Fires every 0am"
  schedule_expression = "cron(0/3 * * * ? *)"
}

resource "aws_cloudwatch_event_target" "invoke_everyday_3min" {
  rule      = aws_cloudwatch_event_rule.every_3min.name
  target_id = "every_3min"
  arn       = aws_lambda_function.lambda.arn
}

resource "aws_lambda_permission" "lambda_permission_to_cloudwatch_call" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_3min.arn
}