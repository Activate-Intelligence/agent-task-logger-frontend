# Vite Static Frontend Infrastructure
# This file configures AWS resources for deploying the Vite React app as a static site

# Reference existing S3 bucket for frontend static assets
data "aws_s3_bucket" "lambda_artifacts" {
  bucket = "${var.s3_bucket_prefix}-lambda-artifacts"
}

# S3 bucket name for frontend assets (using existing artifacts bucket with path prefix)
locals {
  assets_bucket_name   = data.aws_s3_bucket.lambda_artifacts.id
  assets_bucket_prefix = "agent-task-logger-frontend/${var.environment}/frontend"
}

# CloudFront Origin Access Identity for S3
resource "aws_cloudfront_origin_access_identity" "frontend" {
  comment = "task-logger-frontend-${var.environment}"
}

# S3 Bucket Policy to allow CloudFront access
resource "aws_s3_bucket_policy" "frontend_assets" {
  bucket = data.aws_s3_bucket.lambda_artifacts.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontAccess-${var.environment}"
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.frontend.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${data.aws_s3_bucket.lambda_artifacts.arn}/${local.assets_bucket_prefix}*"
      }
    ]
  })
}

# CloudFront Distribution for Static Site
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "task-logger-frontend-${var.environment}"
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # US, Canada, Europe

  origin {
    domain_name = data.aws_s3_bucket.lambda_artifacts.bucket_regional_domain_name
    origin_id   = "S3-Frontend"
    origin_path = "/${local.assets_bucket_prefix}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-Frontend"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # Cache behavior for static assets (immutable, long cache)
  ordered_cache_behavior {
    path_pattern     = "/assets/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-Frontend"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 31536000 # 1 year
    max_ttl                = 31536000
    compress               = true
  }

  # Custom error response for SPA routing (404 -> index.html)
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
    error_caching_min_ttl = 0
  }

  # Custom error response for 403 (also redirect to index.html for SPA)
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name        = "task-logger-frontend-${var.environment}"
    Environment = var.environment
    Application = "agent-task-logger-frontend"
    ManagedBy   = "Terraform"
  }
}
