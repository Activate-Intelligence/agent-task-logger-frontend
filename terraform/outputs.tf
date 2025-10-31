# Outputs
output "frontend_url" {
  value       = aws_lambda_function_url.frontend_server.function_url
  description = "Frontend application URL (direct Lambda Function URL)"
}

output "server_lambda_name" {
  value       = aws_lambda_function.frontend_server.function_name
  description = "Server Lambda function name"
}

output "server_lambda_url" {
  value       = aws_lambda_function_url.frontend_server.function_url
  description = "Server Lambda function URL"
}

output "image_lambda_name" {
  value       = aws_lambda_function.frontend_image.function_name
  description = "Image optimization Lambda function name"
}

output "image_lambda_url" {
  value       = aws_lambda_function_url.frontend_image.function_url
  description = "Image optimization Lambda function URL"
}

output "revalidation_lambda_name" {
  value       = aws_lambda_function.frontend_revalidation.function_name
  description = "Revalidation Lambda function name"
}

output "assets_bucket_name" {
  value       = aws_s3_bucket.frontend_assets.id
  description = "Frontend assets S3 bucket name"
}

output "cache_table_name" {
  value       = aws_dynamodb_table.frontend_cache.name
  description = "DynamoDB cache table name"
}

output "revalidation_queue_url" {
  value       = aws_sqs_queue.revalidation.url
  description = "Revalidation SQS queue URL"
}
