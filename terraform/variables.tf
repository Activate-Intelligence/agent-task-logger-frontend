########################################
#            Input Variables           #
########################################
variable "function_name" {
  description = "Name of the Lambda function"
  type        = string
  default     = "agent-task-logger-frontend"
}

variable "s3_bucket" {
  description = "S3 bucket containing the deployment packages"
  type        = string
  default     = "533267084389-lambda-artifacts"
}

variable "s3_prefix" {
  description = "S3 prefix for the deployment packages (e.g., agent-task-logger-frontend/dev/)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-2"
}

variable "environment" {
  description = "Environment (dev/prod)"
  type        = string
  default     = "dev"
}

variable "s3_bucket_prefix" {
  description = "Prefix for S3 bucket names (AWS account ID)"
  type        = string
  default     = "533267084389"
}
