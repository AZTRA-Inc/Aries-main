# EC2 Deployment (GitHub Actions Driven)

This stack creates an Ubuntu `t3.micro` EC2 instance in the default VPC using key pair `new_aztra_key`.
It also integrates with existing ALB `aries-service` by creating:

- a dedicated target group,
- target attachment for this EC2 instance,
- HTTPS listener (443) host-header rule for `aries.aztra.ai`.

Application setup and deployment are handled by GitHub Actions (not `user_data`), and no Nginx is used.
EC2 serves static files directly with `serve` on port `3000`, while ALB terminates HTTPS on `443`.

## Provision EC2

From this directory:

```powershell
terraform init
terraform apply -auto-approve
terraform output
```

Use `public_ip` output to connect or configure DNS.

## GitHub Secrets Required

In your repository settings, add:

- `EC2_HOST` = EC2 public IP or DNS (SSH destination)
- `EC2_USER` = `ubuntu`
- `EC2_SSH_KEY` = private key content for `new_aztra_key` (PEM text)

## Cloudflare

- Create DNS record: `aries` -> CNAME to your ALB DNS output
- Keep Cloudflare proxy ON (orange cloud)
- Use SSL mode `Full (strict)` if Cloudflare proxies to ALB HTTPS

## Deploy

Push to `main` branch or run workflow manually:

- Workflow file: `.github/workflows/deploy-ec2.yml`
