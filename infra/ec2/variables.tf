variable "aws_region" {
  description = "AWS region for EC2 deployment."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used in tags."
  type        = string
  default     = "aries-frontend"
}

variable "environment" {
  description = "Environment name."
  type        = string
  default     = "prod"
}

variable "instance_type" {
  description = "EC2 instance type."
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "Existing EC2 key pair name."
  type        = string
  default     = "new_aztra_key"
}

variable "existing_alb_name" {
  description = "Existing ALB name where listener rule should be added."
  type        = string
  default     = "aries-service"
}

variable "listener_port" {
  description = "ALB listener port for host-based routing."
  type        = number
  default     = 443
}

variable "host_header" {
  description = "Host header for ALB listener rule."
  type        = string
  default     = "aries.aztra.ai"
}

variable "listener_rule_priority" {
  description = "Unique priority number for the ALB listener rule."
  type        = number
  default     = 2
}
