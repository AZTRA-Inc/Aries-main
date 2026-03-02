variable "aws_region" {
  description = "AWS region for S3 bucket. Keep your ACM cert in us-east-1 for CloudFront."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used in resource naming."
  type        = string
  default     = "aries-frontend"
}

variable "environment" {
  description = "Environment name, e.g. prod/staging."
  type        = string
  default     = "prod"
}

variable "bucket_name" {
  description = "Globally unique S3 bucket name for static files."
  type        = string
}

variable "domain_names" {
  description = "Domains served by CloudFront, e.g. [\"example.com\", \"www.example.com\"]."
  type        = list(string)
  default     = []
}

variable "acm_certificate_arn" {
  description = "Optional ACM certificate ARN in us-east-1 for custom CloudFront aliases."
  type        = string
  default     = null
}
