# OpenNext Frontend Infrastructure
# This file configures AWS resources for deploying Next.js with OpenNext

# Reference existing S3 bucket for frontend static assets and cache
data "aws_s3_bucket" "lambda_artifacts" {
  bucket = "${var.s3_bucket_prefix}-lambda-artifacts"
}

# S3 bucket name for frontend assets (using existing artifacts bucket with path prefix)
locals {
  assets_bucket_name   = data.aws_s3_bucket.lambda_artifacts.id
  assets_bucket_prefix = "agent-task-logger-frontend/${var.environment}/frontend/"
}

# DynamoDB table for ISR cache and tags
resource "aws_dynamodb_table" "frontend_cache" {
  name         = "task-logger-cache-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "tag"
  range_key    = "path"

  attribute {
    name = "tag"
    type = "S"
  }

  attribute {
    name = "path"
    type = "S"
  }

  attribute {
    name = "revalidatedAt"
    type = "N"
  }

  # Global Secondary Index for revalidation queries
  global_secondary_index {
    name            = "revalidate"
    hash_key        = "path"
    range_key       = "revalidatedAt"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expireAt"
    enabled        = true
  }

  tags = {
    Name        = "task-logger-cache-${var.environment}"
    Environment = var.environment
    Application = "agent-task-logger-frontend"
    ManagedBy   = "Terraform"
  }
}

# SQS Queue for revalidation
resource "aws_sqs_queue" "revalidation" {
  name                        = "task-logger-revalidation-${var.environment}.fifo"
  fifo_queue                  = true
  content_based_deduplication = true
  visibility_timeout_seconds  = 30

  tags = {
    Name        = "task-logger-revalidation-${var.environment}"
    Environment = var.environment
    Application = "agent-task-logger-frontend"
    ManagedBy   = "Terraform"
  }
}

# IAM Role for Server Lambda Function
resource "aws_iam_role" "frontend_server_lambda" {
  name = "task-logger-frontend-server-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })

  tags = {
    Name        = "task-logger-frontend-server-${var.environment}"
    Environment = var.environment
    Application = "agent-task-logger-frontend"
    ManagedBy   = "Terraform"
  }
}

# IAM Policy for Server Lambda
resource "aws_iam_role_policy" "frontend_server_lambda" {
  name = "task-logger-frontend-server-policy-${var.environment}"
  role = aws_iam_role.frontend_server_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${data.aws_s3_bucket.lambda_artifacts.arn}/${local.assets_bucket_prefix}*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = data.aws_s3_bucket.lambda_artifacts.arn
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.frontend_cache.arn,
          "${aws_dynamodb_table.frontend_cache.arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage"
        ]
        Resource = aws_sqs_queue.revalidation.arn
      }
    ]
  })
}

# Lambda Function for Server (Main Next.js SSR)
resource "aws_lambda_function" "frontend_server" {
  function_name = "task-logger-frontend-server-${var.environment}"
  role          = aws_iam_role.frontend_server_lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = 30
  memory_size   = 1024

  s3_bucket = var.s3_bucket
  s3_key    = "${var.s3_prefix}deployment-server.zip"

  environment {
    variables = {
      # Asset serving configuration (for static files from S3)
      BUCKET_NAME               = local.assets_bucket_name
      BUCKET_REGION             = var.aws_region
      BUCKET_KEY_PREFIX         = local.assets_bucket_prefix
      # Cache configuration (for ISR/SSR caching)
      CACHE_BUCKET_NAME         = local.assets_bucket_name
      CACHE_BUCKET_REGION       = var.aws_region
      CACHE_BUCKET_KEY_PREFIX   = "${local.assets_bucket_prefix}_cache"
      CACHE_DYNAMO_TABLE        = aws_dynamodb_table.frontend_cache.name
      REVALIDATION_QUEUE_URL    = aws_sqs_queue.revalidation.url
      REVALIDATION_QUEUE_REGION = var.aws_region
    }
  }

  tags = {
    Name        = "task-logger-frontend-server-${var.environment}"
    Environment = var.environment
    Application = "agent-task-logger-frontend"
    ManagedBy   = "Terraform"
  }
}

# Lambda Function URL for Server
resource "aws_lambda_function_url" "frontend_server" {
  function_name      = aws_lambda_function.frontend_server.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    allow_headers     = ["*"]
    max_age           = 86400
  }
}

# IAM Role for Image Optimization Lambda
resource "aws_iam_role" "frontend_image_lambda" {
  name = "task-logger-frontend-image-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })

  tags = {
    Name        = "task-logger-frontend-image-${var.environment}"
    Environment = var.environment
    Application = "agent-task-logger-frontend"
    ManagedBy   = "Terraform"
  }
}

# IAM Policy for Image Optimization Lambda
resource "aws_iam_role_policy" "frontend_image_lambda" {
  name = "task-logger-frontend-image-policy-${var.environment}"
  role = aws_iam_role.frontend_image_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject"
        ]
        Resource = "${data.aws_s3_bucket.lambda_artifacts.arn}/${local.assets_bucket_prefix}*"
      }
    ]
  })
}

# Lambda Function for Image Optimization
resource "aws_lambda_function" "frontend_image" {
  function_name = "task-logger-frontend-image-${var.environment}"
  role          = aws_iam_role.frontend_image_lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = 30
  memory_size   = 1536

  s3_bucket = var.s3_bucket
  s3_key    = "${var.s3_prefix}deployment-image.zip"

  environment {
    variables = {
      BUCKET_NAME   = local.assets_bucket_name
      BUCKET_REGION = var.aws_region
      BUCKET_KEY_PREFIX = local.assets_bucket_prefix
    }
  }

  tags = {
    Name        = "task-logger-frontend-image-${var.environment}"
    Environment = var.environment
    Application = "agent-task-logger-frontend"
    ManagedBy   = "Terraform"
  }
}

# Lambda Function URL for Image Optimization
resource "aws_lambda_function_url" "frontend_image" {
  function_name      = aws_lambda_function.frontend_image.function_name
  authorization_type = "NONE"
}

# IAM Role for Revalidation Lambda
resource "aws_iam_role" "frontend_revalidation_lambda" {
  name = "task-logger-frontend-revalidation-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })

  tags = {
    Name        = "task-logger-frontend-revalidation-${var.environment}"
    Environment = var.environment
    Application = "agent-task-logger-frontend"
    ManagedBy   = "Terraform"
  }
}

# IAM Policy for Revalidation Lambda
resource "aws_iam_role_policy" "frontend_revalidation_lambda" {
  name = "task-logger-frontend-revalidation-policy-${var.environment}"
  role = aws_iam_role.frontend_revalidation_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.revalidation.arn
      },
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = aws_lambda_function.frontend_server.arn
      }
    ]
  })
}

# Lambda Function for Revalidation
resource "aws_lambda_function" "frontend_revalidation" {
  function_name = "task-logger-frontend-revalidation-${var.environment}"
  role          = aws_iam_role.frontend_revalidation_lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = 30
  memory_size   = 512

  s3_bucket = var.s3_bucket
  s3_key    = "${var.s3_prefix}deployment-revalidation.zip"

  environment {
    variables = {
      SERVER_FUNCTION_NAME = aws_lambda_function.frontend_server.function_name
    }
  }

  tags = {
    Name        = "task-logger-frontend-revalidation-${var.environment}"
    Environment = var.environment
    Application = "agent-task-logger-frontend"
    ManagedBy   = "Terraform"
  }
}

# Event Source Mapping for Revalidation Queue
resource "aws_lambda_event_source_mapping" "revalidation_queue" {
  event_source_arn = aws_sqs_queue.revalidation.arn
  function_name    = aws_lambda_function.frontend_revalidation.arn
  batch_size       = 5
}
