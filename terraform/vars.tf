variable "aws_region" {
  description = "The AWS region to create things in."
  default = "us-east-1"
}

variable "bucket_name" {
  description = "Name of Terraform state bucket"
  default     = "safe-bin"
}
