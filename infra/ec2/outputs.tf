output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.web.id
}

output "public_ip" {
  description = "EC2 public IP"
  value       = aws_instance.web.public_ip
}

output "public_dns" {
  description = "EC2 public DNS"
  value       = aws_instance.web.public_dns
}

output "alb_dns_name" {
  description = "Existing ALB DNS name"
  value       = data.aws_lb.existing.dns_name
}

output "target_group_arn" {
  description = "Target group ARN for frontend instance"
  value       = aws_lb_target_group.frontend.arn
}
