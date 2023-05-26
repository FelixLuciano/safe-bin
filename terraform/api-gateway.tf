resource "aws_api_gateway_rest_api" "api" {
  name = "safebin-api"
}

# Route /keys

resource "aws_api_gateway_resource" "api_resource_keys" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "key"
}

resource "aws_api_gateway_method" "api_method_keys" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.api_resource_keys.id
  http_method   = "GET"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.key_id" = true
  }
}

resource "aws_api_gateway_integration" "api_view_keys" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.api_resource_keys.id
  http_method = aws_api_gateway_method.api_method_keys.http_method
  depends_on  = [aws_lambda_function.api_view_keys]

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api_view_keys.invoke_arn
}

# Route /data

resource "aws_api_gateway_resource" "api_resource_data" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "data"
}

resource "aws_api_gateway_method" "api_method_data" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.api_resource_data.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "api_view_data" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.api_resource_data.id
  http_method = aws_api_gateway_method.api_method_data.http_method
  depends_on  = [aws_lambda_function.api_view_data]

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api_view_data.invoke_arn
}

# Route /data/{key_id} (GET, POST)

resource "aws_api_gateway_resource" "api_resource_data_key" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.api_resource_data.id
  path_part   = "{key_id}"
}

resource "aws_api_gateway_method" "api_method_data_key_access" {
  for_each = toset(["GET", "POST"])

  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.api_resource_data_key.id
  http_method   = each.value
  authorization = "NONE"

  request_parameters = {
    "method.request.path.key_id" = true
  }
}

resource "aws_api_gateway_integration" "api_view_data_key_access" {
  for_each = toset(["GET", "POST"])

  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.api_resource_data_key.id
  http_method = aws_api_gateway_method.api_method_data_key_access[each.key].http_method
  depends_on  = [aws_lambda_function.api_view_data_key_access]

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api_view_data_key_access.invoke_arn
}

# Route /data/{key_id} (PUT, DELETE)

resource "aws_api_gateway_method" "api_method_data_key_modify" {
  for_each = toset(["PUT", "DELETE"])

  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.api_resource_data_key.id
  http_method   = each.value
  authorization = "NONE"

  request_parameters = {
    "method.request.path.key_id" = true
  }
}

resource "aws_api_gateway_integration" "api_view_data_key_modify" {
  for_each = toset(["PUT", "DELETE"])

  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.api_resource_data_key.id
  http_method = aws_api_gateway_method.api_method_data_key_modify[each.key].http_method
  depends_on  = [aws_lambda_function.api_view_data_key_modify]

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api_view_data_key_modify.invoke_arn
}

# Production deployment

resource "aws_api_gateway_deployment" "production" {
  rest_api_id = aws_api_gateway_rest_api.api.id

  depends_on = [
    aws_api_gateway_integration.api_view_data,
    aws_api_gateway_integration.api_view_data_key_access,
    aws_api_gateway_integration.api_view_data_key_modify,
  ]
}

resource "aws_api_gateway_stage" "production" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  deployment_id = aws_api_gateway_deployment.production.id
  stage_name    = "production"
}

output "api_endpoint" {
  value = "${aws_api_gateway_deployment.production.invoke_url}${aws_api_gateway_stage.production.stage_name}"
}
