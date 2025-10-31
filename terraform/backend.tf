terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }

  backend "s3" {
    # Backend configuration is provided via -backend-config flags in GitHub Actions
    # terraform init -backend-config="bucket=533267084389-tf-state" \
    #                -backend-config="key=aws/{environment}/agents/agent-task-logger-frontend" \
    #                -backend-config="region=eu-west-2" \
    #                -backend-config="encrypt=true"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "agent-task-logger-frontend"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
