data "aws_iam_policy_document" "policy_for_cloudwatch_logs" {
  version = "2012-10-17"
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      identifiers = ["lambda.amazonaws.com"]
      type        = "Service"
    }
    effect = "Allow"
    sid    = ""
  }
//  statement {
//    effect = "Allow"
//    actions = [
//      "logs:CreateLogGroup",
//      "logs:CreateLogStream",
//      "logs:PutLogEvents"
//    ]
//    resources = [
//      "arn:aws:logs:${var.region}:${var.account_id}:log-group:*"
//    ]
//  }
}