terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.0.0"
    }
  }
}

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
