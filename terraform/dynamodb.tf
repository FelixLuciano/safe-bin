resource "aws_dynamodb_table" "data" {
  name           = "safebin_data"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "key_id"

  attribute {
    name = "key_id"
    type = "S"
  }
}
