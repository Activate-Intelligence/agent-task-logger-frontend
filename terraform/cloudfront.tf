# CloudFront distribution for frontend (minimal config for asset routing only)
# Required because OpenNext expects static assets to be served separately from Lambda

# Origin Access Control for S3
resource "aws_cloudfront_origin_access_control" "frontend_s3" {
  name                              = "task-logger-frontend-s3-${var.environment}"
  description                       = "OAC for Task Logger frontend S3 assets"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "frontend_opennext" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Task Logger Frontend (${var.environment}) - OpenNext"
  default_root_object = ""
  price_class         = "PriceClass_100" # Use only North America and Europe edge locations

  # Origin 1: Server Lambda for SSR/ISR pages
  origin {
    domain_name = replace(replace(aws_lambda_function_url.frontend_server.function_url, "https://", ""), "/", "")
    origin_id   = "ServerLambda"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Origin 2: S3 for static assets
  origin {
    domain_name              = data.aws_s3_bucket.lambda_artifacts.bucket_regional_domain_name
    origin_id                = "S3Assets"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend_s3.id
    origin_path              = "/${local.assets_bucket_prefix}_assets"
  }

  # Default behavior: Route to Server Lambda
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = "ServerLambda"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      headers      = ["Accept", "Accept-Language", "Authorization", "CloudFront-Viewer-Country", "User-Agent", "X-Forwarded-For"]

      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 31536000
  }

  # Behavior for static assets: Route to S3
  ordered_cache_behavior {
    path_pattern     = "/_next/static/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Assets"
    compress         = true

    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      headers      = ["Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"]

      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400      # 1 day
    max_ttl     = 31536000   # 1 year
  }

  # Behavior for image optimization
  ordered_cache_behavior {
    path_pattern     = "/_next/image*"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ServerLambda" # Image optimization goes through Lambda

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = true
      headers      = ["Accept"]

      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400    # 1 day
    max_ttl     = 31536000 # 1 year
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

# S3 bucket policy to allow CloudFront OAC access
resource "aws_s3_bucket_policy" "frontend_assets" {
  bucket = data.aws_s3_bucket.lambda_artifacts.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOAC-TaskLogger-${var.environment}"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${data.aws_s3_bucket.lambda_artifacts.arn}/${local.assets_bucket_prefix}_assets/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend_opennext.arn
          }
        }
      }
    ]
  })
}
