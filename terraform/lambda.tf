data "archive_file" "root_update" {
  type        = "zip"
  source_file = "../src/update.py"
  output_path = "../build/root_update.payload.zip"
}


data "aws_iam_policy_document" "lambda_policy" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = [
      "sts:AssumeRole"
    ]
  }
}

resource "aws_iam_role" "lambda_role" {
  name               = "lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_policy.json
}

resource "aws_lambda_function" "root_update" {
  function_name = "root_update"
  description   = "Hello World"
  filename      = "../build/root_update.payload.zip"
  handler       = "update.handler"

  role             = aws_iam_role.lambda_role.arn
  source_code_hash = data.archive_file.root_update.output_base64sha256

  runtime = "python3.9"
}

resource "aws_lambda_permission" "api_gateway_invoke_root_update" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.root_update.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.base_api.execution_arn}/*/*/*"
}
