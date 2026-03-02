# Static Hosting Deployment (S3 + CloudFront)

This folder provisions and deploys your Next.js static export using:

- Amazon S3 (private bucket for files)
- Amazon CloudFront (CDN + HTTPS using ACM cert in `us-east-1`)

## 1) Prerequisites

- Terraform >= 1.6
- AWS CLI configured (`aws configure`)
- Node.js + npm

## 2) Configure variables

From this folder, copy the example file:

```powershell
Copy-Item terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and set:

- `bucket_name` to a globally unique name
- `domain_names` to your real domains
- `acm_certificate_arn` (already set to your certificate by default)

## 3) Provision infrastructure

```powershell
terraform init
terraform plan
terraform apply
```

After apply, note output `cloudfront_distribution_domain_name`.

## 4) Deploy app files

Still in this folder:

```powershell
.\deploy-static.ps1
```

This script builds your app, uploads `out/` to S3, and invalidates CloudFront cache.

## 5) DNS in Cloudflare

Manually create this DNS record in Cloudflare:

- `aries` -> CNAME -> `<cloudfront_distribution_domain_name>` (proxied ON)

Then browse `https://aries.aztra.ai`.
