# AWS S3 + CloudFront Configuration Guide

This document contains the configuration needed to properly host the AV Tree Pros website on AWS S3 with CloudFront.

## S3 Bucket Configuration

### 1. S3 Bucket Settings

**Bucket Name:** `avtreepros.com` (or your chosen bucket name)

**Static Website Hosting:**
- Enable Static Website Hosting
- Index document: `index.html`
- Error document: `404.html`

### 2. S3 Bucket Policy

Replace `YOUR-BUCKET-NAME` with your actual bucket name:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

### 3. CORS Configuration (if needed)

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [],
        "MaxAgeSeconds": 3000
    }
]
```

## CloudFront Distribution Configuration

### 1. Origin Settings

- **Origin Domain Name:** `YOUR-BUCKET-NAME.s3-website-REGION.amazonaws.com`
  - Use the S3 website endpoint, NOT the REST API endpoint
  - Example: `avtreepros.s3-website-us-west-2.amazonaws.com`

- **Origin Protocol Policy:** HTTP Only (for S3 website endpoints)

### 2. Default Cache Behavior Settings

- **Viewer Protocol Policy:** Redirect HTTP to HTTPS
- **Allowed HTTP Methods:** GET, HEAD, OPTIONS
- **Cache Policy:** CachingOptimized (or create custom)
- **Compress Objects Automatically:** Yes

### 3. Custom Error Responses

Configure these custom error responses to handle directory URLs properly:

| HTTP Error Code | Response Page Path | HTTP Response Code | TTL (seconds) |
|-----------------|-------------------|-------------------|---------------|
| 403             | /404.html         | 404               | 300           |
| 404             | /404.html         | 404               | 300           |

### 4. CloudFront Functions (IMPORTANT for directory URLs)

Create a CloudFront Function to append `index.html` to directory requests:

**Function Name:** `url-rewrite-function`

**Event Type:** Viewer Request

**Function Code:**
```javascript
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Check whether the URI is missing a file name
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    } 
    // Check whether the URI is missing a file extension
    else if (!uri.includes('.')) {
        request.uri += '/index.html';
    }
    
    return request;
}
```

**Associate this function with your CloudFront distribution's Default Cache Behavior.**

### 5. Alternate Domain Names (CNAMEs)

Add your custom domains:
- `avtreepros.com`
- `www.avtreepros.com`

### 6. SSL Certificate

- Request or import an SSL certificate in **ACM (AWS Certificate Manager)**
- Must be in **us-east-1** region for CloudFront
- Add both `avtreepros.com` and `www.avtreepros.com` to the certificate

### 7. Default Root Object

**Default Root Object:** `index.html`

## Deployment Process

### Option 1: AWS CLI Upload

```bash
# Sync files to S3 bucket
aws s3 sync . s3://YOUR-BUCKET-NAME \
  --exclude ".git/*" \
  --exclude ".DS_Store" \
  --exclude "README.md" \
  --exclude "aws-config.md" \
  --cache-control "public, max-age=31536000" \
  --exclude "*.html" \
  --exclude "*.css" \
  --exclude "*.js"

# Upload HTML files with shorter cache
aws s3 sync . s3://YOUR-BUCKET-NAME \
  --exclude "*" \
  --include "*.html" \
  --cache-control "public, max-age=3600"

# Upload CSS/JS with medium cache
aws s3 sync . s3://YOUR-BUCKET-NAME \
  --exclude "*" \
  --include "*.css" \
  --include "*.js" \
  --cache-control "public, max-age=86400"

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR-DISTRIBUTION-ID \
  --paths "/*"
```

### Option 2: GitHub Actions (Automated Deployment)

Create `.github/workflows/deploy.yml` for automatic deployments on push.

## DNS Configuration

Point your domain to CloudFront:

### Route 53 (if using AWS DNS)
- Create an A record (Alias) pointing to your CloudFront distribution
- Create a CNAME for `www` pointing to your CloudFront distribution

### Other DNS Providers
- Create a CNAME record for `www.avtreepros.com` pointing to your CloudFront domain
- Create a CNAME or ALIAS record for `avtreepros.com` pointing to your CloudFront domain

## Testing Checklist

After deployment, verify:

- [ ] Homepage loads: `https://avtreepros.com`
- [ ] WWW redirect works: `https://www.avtreepros.com`
- [ ] HTTP redirects to HTTPS
- [ ] Directory URLs work: `https://avtreepros.com/services/`
- [ ] Subdirectory URLs work: `https://avtreepros.com/services/tree-trimming/`
- [ ] 404 page displays for invalid URLs
- [ ] All images load correctly
- [ ] CSS and JS files load correctly
- [ ] Mobile responsive design works

## Common Issues & Solutions

### Issue: "Access Denied" errors
**Solution:** Ensure S3 bucket policy allows public read access

### Issue: Directory URLs return 403/404
**Solution:** Verify CloudFront Function is attached and working

### Issue: Changes not appearing
**Solution:** Create CloudFront invalidation for updated files

### Issue: Mixed content warnings
**Solution:** Ensure all assets use HTTPS or protocol-relative URLs

## Performance Optimization

1. **Enable Gzip/Brotli compression** in CloudFront
2. **Set appropriate cache headers** for different file types
3. **Use CloudFront caching** to reduce S3 requests
4. **Enable HTTP/2** in CloudFront (enabled by default)
5. **Consider using CloudFront's origin shield** for high-traffic sites

## Monitoring

- Use **CloudFront Reports** to monitor traffic
- Set up **CloudWatch alarms** for errors
- Monitor **S3 bucket metrics** for unusual activity
