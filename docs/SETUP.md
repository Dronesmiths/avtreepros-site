# S3 + CloudFront Quick Setup Guide

## 🚀 Quick Start

Your site is now configured to work with AWS S3 and CloudFront! Here's what you need to do:

## 1️⃣ AWS Configuration

### Required AWS Resources:
- ✅ S3 Bucket (for storing files)
- ✅ CloudFront Distribution (for CDN)
- ✅ SSL Certificate (for HTTPS)
- ✅ Route 53 or DNS provider (for domain)

### GitHub Secrets to Configure:

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | Your S3 bucket region | `us-west-2` |
| `S3_BUCKET` | Your S3 bucket name | `avtreepros.com` |
| `CLOUDFRONT_DISTRIBUTION_ID` | Your CloudFront distribution ID | `E1234EXAMPLE` |

## 2️⃣ CloudFront Function Setup

**CRITICAL:** You must create a CloudFront Function to handle directory URLs properly.

1. Go to CloudFront → Functions → Create function
2. Name: `url-rewrite-function`
3. Paste this code:

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

4. Publish the function
5. Go to your CloudFront Distribution → Behaviors → Edit Default (*)
6. Under "Function associations" → Viewer request → Select your function
7. Save changes

## 3️⃣ S3 Bucket Configuration

### Static Website Hosting:
1. Go to S3 → Your bucket → Properties
2. Scroll to "Static website hosting"
3. Enable it
4. Index document: `index.html`
5. Error document: `404.html`

### Bucket Policy:
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

## 4️⃣ CloudFront Distribution Settings

### Origin Settings:
- **Origin Domain**: Use the S3 **website endpoint**, NOT the bucket endpoint
  - ✅ Correct: `avtreepros.s3-website-us-west-2.amazonaws.com`
  - ❌ Wrong: `avtreepros.s3.amazonaws.com`

### Custom Error Responses:
Add these two error responses:

| HTTP Code | Response Page | Response Code | TTL |
|-----------|--------------|---------------|-----|
| 403 | `/404.html` | 404 | 300 |
| 404 | `/404.html` | 404 | 300 |

### SSL Certificate:
- Request certificate in ACM (us-east-1 region only!)
- Add domains: `avtreepros.com` and `www.avtreepros.com`
- Attach to CloudFront distribution

## 5️⃣ Deployment Options

### Option A: GitHub Actions (Automated)
- Push to `main` branch → Automatically deploys
- Already configured in `.github/workflows/deploy.yml`

### Option B: Manual Deployment Script
```bash
# 1. Edit deploy.sh with your bucket name and distribution ID
nano deploy.sh

# 2. Run the deployment script
./deploy.sh
```

### Option C: AWS CLI Direct
```bash
# Upload to S3
aws s3 sync . s3://YOUR-BUCKET-NAME --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR-DISTRIBUTION-ID \
  --paths "/*"
```

## 6️⃣ DNS Configuration

Point your domain to CloudFront:

### For Route 53:
- Create A record (Alias) → CloudFront distribution
- Create CNAME for `www` → CloudFront distribution

### For Other DNS Providers:
- CNAME: `www.avtreepros.com` → `d111111abcdef8.cloudfront.net`
- CNAME or ALIAS: `avtreepros.com` → `d111111abcdef8.cloudfront.net`

## ✅ Testing Checklist

After deployment, test these URLs:

- [ ] `https://avtreepros.com` - Homepage loads
- [ ] `https://www.avtreepros.com` - WWW works
- [ ] `https://avtreepros.com/services/` - Directory URL works
- [ ] `https://avtreepros.com/services/tree-trimming/` - Nested directory works
- [ ] `https://avtreepros.com/invalid-page` - Shows 404 page
- [ ] All images load
- [ ] CSS styles apply
- [ ] JavaScript works
- [ ] Mobile responsive

## 🔧 Troubleshooting

### "Access Denied" errors
→ Check S3 bucket policy allows public read

### Directory URLs return 403/404
→ Verify CloudFront Function is attached

### Changes not appearing
→ Create CloudFront invalidation

### Mixed content warnings
→ Ensure all assets use HTTPS

## 📚 Files Created

- `404.html` - Custom error page
- `aws-config.md` - Detailed AWS configuration guide
- `deploy.sh` - Manual deployment script
- `.github/workflows/deploy.yml` - Automated deployment (updated)
- `SETUP.md` - This file

## 🎯 Next Steps

1. Configure your AWS resources (S3, CloudFront, ACM)
2. Add GitHub secrets
3. Create and attach CloudFront Function
4. Push to GitHub or run `./deploy.sh`
5. Update DNS to point to CloudFront
6. Test everything!

## 📞 Need Help?

Refer to `aws-config.md` for detailed configuration instructions.
