provider "aws" {
  region = var.aws_region
}

terraform {
  backend "s3" {
    bucket  = "safe-bin"
    key     = "terraform.tsstate"
    region  = "us-east-1"
    encrypt = true
  }
}
