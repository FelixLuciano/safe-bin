resource "aws_kms_key" "master_key" {
  description = "SafeBin API Master Key"
}

resource "aws_kms_grant" "master_grant" {
  key_id            = aws_kms_key.master_key.key_id
  grantee_principal = aws_iam_role.lambda_role.arn
  operations = [
    "GenerateDataKey",
    "Decrypt"
  ]
}
