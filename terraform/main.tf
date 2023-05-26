provider "aws" {
  region = "us-east-1"
}

terraform {
  backend "s3" {
    bucket  = "safe-bin"
    key     = "terraform.tsstate"
    region  = "us-east-1"
    encrypt = true
  }
}
