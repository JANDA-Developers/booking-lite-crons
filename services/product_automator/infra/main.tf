resource "aws_iam_role" "iam_for_lambda" {
  name               = "iam_for_lambda"
  assume_role_policy = data.aws_iam_policy_document.policy_for_cloudwatch_logs.json

  tags = {
    Name        = "${var.environment}-iam-for-lambda"
    Environment = var.environment
  }
}

resource "aws_lambda_function" "lambda" {
  function_name = "${var.environment}-product-create-cron"
  handler       = var.handler_name
  role          = aws_iam_role.iam_for_lambda.arn
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

resource "aws_cloudwatch_event_rule" "everyday_0am_kr" {
  name                = "everyday"
  description         = "Fires every 0am"
  schedule_expression = "cron(0 15 * * ? *)"
}

resource "aws_cloudwatch_event_target" "check_foo_every_five_minutes" {
  rule      = aws_cloudwatch_event_rule.everyday_0am_kr.name
  target_id = "everyday_0am_kr"
  arn       = aws_lambda_function.lambda.arn
}

resource "aws_lambda_permission" "lambda_permission_to_cloudwatch_call" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.everyday_0am_kr.arn
}