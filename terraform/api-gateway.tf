# Create the API Gateway
resource "aws_api_gateway_rest_api" "base_api" {
  name        = "safebin-api"         # Replace with your desired API Gateway name
  description = "SafeBin API Gateway" # Replace with your desired description
}

# Create the API Gateway resource
resource "aws_api_gateway_resource" "api_resource" {
  rest_api_id = aws_api_gateway_rest_api.base_api.id
  parent_id   = aws_api_gateway_rest_api.base_api.root_resource_id
  path_part   = "api"
}

# Create the API Gateway method
resource "aws_api_gateway_method" "root_method" {
  rest_api_id   = aws_api_gateway_rest_api.base_api.id
  resource_id   = aws_api_gateway_resource.api_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

# Create the API Gateway integration
resource "aws_api_gateway_integration" "api_integration" {
  rest_api_id          = aws_api_gateway_rest_api.base_api.id
  resource_id          = aws_api_gateway_resource.api_resource.id
  http_method          = aws_api_gateway_method.root_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.root_update.invoke_arn
}
