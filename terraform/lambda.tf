# Route /keys

data "archive_file" "api_view_lambda_keys" {
  type        = "zip"
  source_file = "../src/keys.py"
  output_path = "../.build/lambda/keys_view.payload.zip"
}

resource "aws_lambda_function" "api_view_keys" {
  function_name    = "api_view_keys"
  filename         = data.archive_file.api_view_lambda_keys.output_path
  source_code_hash = data.archive_file.api_view_lambda_keys.output_base64sha256
  role             = aws_iam_role.lambda_role.arn
  handler          = "keys.read_handler"
  runtime          = "python3.9"

  environment {
    variables = {
      KMS_MASTER_KEY_ID = aws_kms_key.master_key.key_id
    }
  }
}

resource "aws_lambda_permission" "api_invoke_view_keys" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"
  function_name = aws_lambda_function.api_view_keys.function_name
}

# Route /data

data "archive_file" "api_view_lambda_data" {
  type        = "zip"
  source_file = "../src/data.py"
  output_path = "../.build/lambda/data_view.payload.zip"
}

resource "aws_lambda_function" "api_view_data" {
  function_name    = "api_view_data"
  filename         = data.archive_file.api_view_lambda_data.output_path
  source_code_hash = data.archive_file.api_view_lambda_data.output_base64sha256
  role             = aws_iam_role.lambda_role.arn
  handler          = "data.read_handler"
  runtime          = "python3.9"

  # is dynamodb client
  depends_on = [aws_dynamodb_table.data]

  environment {
    variables = {
      DYNAMODB_DATA_TABLE_NAME = aws_dynamodb_table.data.name
    }
  }
}

resource "aws_lambda_permission" "api_view_invoke_data" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"
  function_name = aws_lambda_function.api_view_data.function_name
}

# Route /data/{key_id} (GET, POST)

data "archive_file" "api_view_lambda_data_key_access" {
  type        = "zip"
  source_file = "../src/data_key_access.py"
  output_path = "../.build/lambda/data_key_access_view.payload.zip"
}

resource "aws_lambda_function" "api_view_data_key_access" {
  function_name    = "api_view_data_key_access"
  filename         = data.archive_file.api_view_lambda_data_key_access.output_path
  source_code_hash = data.archive_file.api_view_lambda_data_key_access.output_base64sha256
  role             = aws_iam_role.lambda_role.arn
  handler          = "data_key_access.create_read_handler"
  runtime          = "python3.9"

  # is dynamodb client
  depends_on = [aws_dynamodb_table.data]

  environment {
    variables = {
      DYNAMODB_DATA_TABLE_NAME = aws_dynamodb_table.data.name
    }
  }
}

resource "aws_lambda_permission" "api_invoke_view_data_key_access" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"
  function_name = aws_lambda_function.api_view_data_key_access.function_name
}


# Route /data/{key_id} (PUT, DELETE)

data "archive_file" "api_view_lambda_data_key_modify" {
  type        = "zip"
  source_file = "../src/data_key_modify.py"
  output_path = "../.build/lambda/data_key_modify_view.payload.zip"
}

data "archive_file" "api_lambda_layer_cryptography" {
  type        = "zip"
  source_dir  = "../.build/layer"
  output_path = "../.build/lambda/cryptography.layer.zip"

}

resource "aws_lambda_layer_version" "cryptography" {
  layer_name          = "cryptography_layer"
  filename            = data.archive_file.api_lambda_layer_cryptography.output_path
  source_code_hash    = data.archive_file.api_lambda_layer_cryptography.output_base64sha256
  compatible_runtimes = ["python3.9"]
}

resource "aws_lambda_function" "api_view_data_key_modify" {
  function_name    = "api_view_data_key_modify"
  filename         = data.archive_file.api_view_lambda_data_key_modify.output_path
  source_code_hash = data.archive_file.api_view_lambda_data_key_modify.output_base64sha256
  role             = aws_iam_role.lambda_role.arn
  handler          = "data_key_modify.update_delete_handler"
  runtime          = "python3.9"
  timeout          = 5

  # is dynamodb client
  depends_on = [aws_dynamodb_table.data]

  environment {
    variables = {
      KMS_MASTER_KEY_ID        = aws_kms_key.master_key.key_id
      DYNAMODB_DATA_TABLE_NAME = aws_dynamodb_table.data.name
    }
  }

  layers = [aws_lambda_layer_version.cryptography.arn]
}

resource "aws_lambda_permission" "api_invoke_view_data_key_modify" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"
  function_name = aws_lambda_function.api_view_data_key_modify.function_name
}
