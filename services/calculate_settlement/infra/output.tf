output lambda_arn {
  value = aws_lambda_function.lambda.arn
}

output lambda_iam_policy_id {
  value = aws_lambda_permission.lambda_permission_to_cloudwatch_call.id
}