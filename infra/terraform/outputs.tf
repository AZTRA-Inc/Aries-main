output "s3_bucket_name" {
  description = "S3 bucket storing static assets."
  value       = aws_s3_bucket.site.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_distribution_domain_name" {
  description = "CloudFront distribution domain, can be used as CNAME target."
  value       = aws_cloudfront_distribution.site.domain_name
}
