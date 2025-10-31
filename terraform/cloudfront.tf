# CloudFront Distribution for OpenNext Frontend
# This configures CloudFront to work with OpenNext Lambda functions and S3

# Origin Access Control for S3 static assets
resource "aws_cloudfront_origin_access_control" "frontend_opennext" {
  name                              = "task-logger-frontend-opennext-${var.environment}-oac"
  description                       = "Origin Access Control for task logger OpenNext S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution with OpenNext origins
resource "aws_cloudfront_distribution" "frontend_opennext" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "Task Logger Frontend (OpenNext) - ${var.environment}"
  price_class     = "PriceClass_100" # US, Canada, Europe only (cheapest)

  # Origin 1: S3 for static assets (_next/*, BUILD_ID)
  origin {
    domain_name              = aws_s3_bucket.frontend_assets.bucket_regional_domain_name
    origin_id                = "S3-frontend-assets"
    origin_path              = "/_assets"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend_opennext.id
  }

  # Origin 2: Lambda Function URL for Server (SSR)
  origin {
    domain_name = replace(replace(aws_lambda_function_url.frontend_server.function_url, "https://", ""), "/", "")
    origin_id   = "Lambda-frontend-server"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }

    custom_header {
      name  = "x-forwarded-host"
      value = aws_cloudfront_distribution.frontend_opennext.domain_name
    }
  }

  # Origin 3: Lambda Function URL for Image Optimization
  origin {
    domain_name = replace(replace(aws_lambda_function_url.frontend_image.function_url, "https://", ""), "/", "")
    origin_id   = "Lambda-frontend-image"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Behavior 1: Image optimization - _next/image*
  ordered_cache_behavior {
    path_pattern           = "_next/image*"
    target_origin_id       = "Lambda-frontend-image"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD", "OPTIONS"]

    # Use AWS Managed CachingOptimized policy for images
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"

    # Use AWS managed origin request policy (AllViewer)
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"
  }

  # Behavior 2: Next.js data - _next/data/*
  ordered_cache_behavior {
    path_pattern           = "_next/data/*"
    target_origin_id       = "Lambda-frontend-server"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    allowed_methods = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods  = ["GET", "HEAD", "OPTIONS"]

    # No caching for ISR data
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # CachingDisabled

    # Use AWS managed origin request policy (AllViewer)
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"
  }

  # Behavior 3: Static assets - _next/static/*
  ordered_cache_behavior {
    path_pattern           = "_next/static/*"
    target_origin_id       = "S3-frontend-assets"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD", "OPTIONS"]

    # Use AWS Managed CachingOptimized policy (long cache)
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"

    # Use AWS managed origin request policy (CORS-S3Origin)
    origin_request_policy_id = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
  }

  # Behavior 4: BUILD_ID
  ordered_cache_behavior {
    path_pattern           = "BUILD_ID"
    target_origin_id       = "S3-frontend-assets"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    # No caching for BUILD_ID
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # CachingDisabled

    # Use AWS managed origin request policy (CORS-S3Origin)
    origin_request_policy_id = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
  }

  # Default behavior: Route all other requests to Lambda Server (SSR)
  default_cache_behavior {
    target_origin_id       = "Lambda-frontend-server"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    allowed_methods = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods  = ["GET", "HEAD", "OPTIONS"]

    # No caching for SSR pages
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # CachingDisabled

    # Use AWS managed origin request policy (AllViewer)
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"

    # Response headers policy for security
    response_headers_policy_id = "67f7725c-6f97-4210-82d7-5512b31e9d03" # SecurityHeadersPolicy
  }

  # Geographic restrictions (none)
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL Certificate (using CloudFront default certificate)
  viewer_certificate {
    cloudfront_default_certificate = true
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  tags = {
    Name        = "task-logger-frontend-opennext-${var.environment}"
    Environment = var.environment
    Application = "agent-task-logger-frontend"
    ManagedBy   = "Terraform"
  }

  # Prevent CloudFront from being destroyed and recreated
  lifecycle {
    create_before_destroy = true
  }
}
