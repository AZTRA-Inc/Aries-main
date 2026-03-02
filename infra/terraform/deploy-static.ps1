param(
  [string]$WorkspaceRoot = "..\.."
)

$ErrorActionPreference = "Stop"

Write-Host "Building static site..."
Push-Location $WorkspaceRoot
npm install
npm run build
Pop-Location

Write-Host "Reading Terraform outputs..."
$bucket = terraform output -raw s3_bucket_name
$distributionId = terraform output -raw cloudfront_distribution_id

$outDir = Resolve-Path "$WorkspaceRoot\out"
if (-not (Test-Path $outDir)) {
  throw "Static output folder not found: $outDir"
}

Write-Host "Syncing static files to S3 bucket: $bucket"
aws s3 sync "$outDir" "s3://$bucket" --delete

Write-Host "Creating CloudFront invalidation: $distributionId"
aws cloudfront create-invalidation --distribution-id $distributionId --paths "/*"

Write-Host "Deployment complete."
