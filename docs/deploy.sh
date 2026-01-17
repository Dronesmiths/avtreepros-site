#!/bin/bash

# AV Tree Pros - AWS S3 Deployment Script
# This script uploads the website to S3 and invalidates CloudFront cache

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration - UPDATE THESE VALUES
S3_BUCKET="YOUR-BUCKET-NAME"
CLOUDFRONT_DISTRIBUTION_ID="YOUR-DISTRIBUTION-ID"
AWS_PROFILE="default"  # Change if using a specific AWS profile

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    echo "Visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if configuration is set
if [ "$S3_BUCKET" = "YOUR-BUCKET-NAME" ]; then
    print_error "Please update the S3_BUCKET variable in this script with your actual bucket name."
    exit 1
fi

if [ "$CLOUDFRONT_DISTRIBUTION_ID" = "YOUR-DISTRIBUTION-ID" ]; then
    print_warning "CloudFront distribution ID not set. Skipping cache invalidation."
    SKIP_INVALIDATION=true
fi

echo "======================================"
echo "  AV Tree Pros - Deployment Script"
echo "======================================"
echo ""
print_status "Starting deployment to S3 bucket: $S3_BUCKET"
echo ""

# Upload images and other static assets with long cache
print_status "Uploading images and static assets..."
aws s3 sync ./images s3://$S3_BUCKET/images \
  --profile $AWS_PROFILE \
  --cache-control "public, max-age=31536000" \
  --delete

# Upload CSS files with medium cache
print_status "Uploading CSS files..."
aws s3 sync ./css s3://$S3_BUCKET/css \
  --profile $AWS_PROFILE \
  --cache-control "public, max-age=86400" \
  --delete

# Upload JavaScript files with medium cache
print_status "Uploading JavaScript files..."
aws s3 sync ./js s3://$S3_BUCKET/js \
  --profile $AWS_PROFILE \
  --cache-control "public, max-age=86400" \
  --delete

# Upload HTML files with short cache
print_status "Uploading HTML files..."
aws s3 sync . s3://$S3_BUCKET \
  --profile $AWS_PROFILE \
  --exclude "*" \
  --include "*.html" \
  --cache-control "public, max-age=3600" \
  --delete

# Upload subdirectory HTML files
print_status "Uploading service pages..."
aws s3 sync ./services s3://$S3_BUCKET/services \
  --profile $AWS_PROFILE \
  --cache-control "public, max-age=3600" \
  --delete

print_status "Uploading location pages..."
aws s3 sync ./locations s3://$S3_BUCKET/locations \
  --profile $AWS_PROFILE \
  --cache-control "public, max-age=3600" \
  --delete

print_status "Uploading about page..."
aws s3 sync ./about s3://$S3_BUCKET/about \
  --profile $AWS_PROFILE \
  --cache-control "public, max-age=3600" \
  --delete

print_status "Uploading contact page..."
aws s3 sync ./contact s3://$S3_BUCKET/contact \
  --profile $AWS_PROFILE \
  --cache-control "public, max-age=3600" \
  --delete

echo ""
print_status "All files uploaded successfully!"

# Invalidate CloudFront cache
if [ "$SKIP_INVALIDATION" != true ]; then
    echo ""
    print_status "Creating CloudFront invalidation..."
    
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --profile $AWS_PROFILE \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    if [ $? -eq 0 ]; then
        print_status "Invalidation created: $INVALIDATION_ID"
        print_warning "Note: It may take 5-15 minutes for changes to propagate globally."
    else
        print_error "Failed to create CloudFront invalidation"
    fi
else
    echo ""
    print_warning "Skipping CloudFront invalidation (distribution ID not configured)"
fi

echo ""
echo "======================================"
print_status "Deployment complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Test your site at: https://avtreepros.com"
echo "2. Verify all pages load correctly"
echo "3. Check mobile responsiveness"
echo ""
