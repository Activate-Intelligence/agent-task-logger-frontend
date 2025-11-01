# Outputs
output "frontend_url" {
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
  description = "Frontend application URL (CloudFront distribution)"
}

output "cloudfront_domain" {
  value       = aws_cloudfront_distribution.frontend.domain_name
  description = "CloudFront distribution domain name"
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.frontend.id
  description = "CloudFront distribution ID (for cache invalidation)"
}

output "assets_bucket_name" {
  value       = local.assets_bucket_name
  description = "Frontend assets S3 bucket name"
}

output "assets_bucket_prefix" {
  value       = local.assets_bucket_prefix
  description = "Frontend assets S3 bucket prefix path"
}
