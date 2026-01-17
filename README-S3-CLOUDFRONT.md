# AV Tree Pros - S3 + CloudFront Configuration Summary

## ✅ What's Been Done

Your website is now configured to work properly with AWS S3 and CloudFront hosting!

### Files Created/Updated:

1. **`404.html`** - Custom 404 error page with your branding
2. **`aws-config.md`** - Comprehensive AWS configuration guide
3. **`deploy.sh`** - Bash script for manual deployments
4. **`SETUP.md`** - Quick setup guide
5. **`.github/workflows/deploy.yml`** - Updated with cache headers and CloudFront invalidation

## 🎯 Key Changes for S3/CloudFront Compatibility

### 1. Directory URL Handling
Your site uses clean URLs like `/services/` and `/about/`. These work locally but need special handling on S3/CloudFront.

**Solution:** CloudFront Function (see SETUP.md)
- Automatically appends `index.html` to directory requests
- `/services/` → `/services/index.html`
- `/about/` → `/about/index.html`

### 2. Cache Control Headers
Different file types now have optimized cache durations:
- **Images**: 1 year (31536000 seconds) - rarely change
- **CSS/JS**: 1 day (86400 seconds) - occasionally change
- **HTML**: 1 hour (3600 seconds) - frequently change

### 3. 404 Error Page
Created a custom 404 page that:
- Matches your site branding
- Provides helpful navigation
- Works with CloudFront error responses

### 4. Deployment Automation
- **GitHub Actions**: Auto-deploy on push to main
- **Manual Script**: `./deploy.sh` for manual deployments
- Both include CloudFront cache invalidation

## 🚀 How to Deploy

### First Time Setup:
1. Follow the steps in `SETUP.md`
2. Configure AWS resources (S3, CloudFront, SSL)
3. Add GitHub secrets
4. Create CloudFront Function (CRITICAL!)

### Ongoing Deployments:

**Option 1: Automatic (Recommended)**
```bash
git add .
git commit -m "Update content"
git push origin main
```
→ GitHub Actions automatically deploys

**Option 2: Manual**
```bash
# Edit deploy.sh with your bucket/distribution ID first
./deploy.sh
```

## ⚠️ Critical CloudFront Function

**YOU MUST CREATE THIS FUNCTION** or directory URLs won't work!

```javascript
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    } 
    else if (!uri.includes('.')) {
        request.uri += '/index.html';
    }
    
    return request;
}
```

Attach it to your CloudFront distribution's Viewer Request.

## 🧪 Testing Your Site

After deployment, test these URLs:

### Should Work:
- ✅ `https://avtreepros.com`
- ✅ `https://avtreepros.com/services/`
- ✅ `https://avtreepros.com/services/tree-trimming/`
- ✅ `https://avtreepros.com/about/`
- ✅ `https://avtreepros.com/contact/`

### Should Show 404:
- ✅ `https://avtreepros.com/invalid-page`

## 📋 AWS Resources Needed

1. **S3 Bucket** - Store website files
2. **CloudFront Distribution** - CDN for fast delivery
3. **ACM SSL Certificate** - HTTPS (must be in us-east-1)
4. **CloudFront Function** - Handle directory URLs
5. **Route 53 or DNS** - Point domain to CloudFront

## 🔐 GitHub Secrets Required

Add these in: GitHub → Settings → Secrets and variables → Actions

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET`
- `CLOUDFRONT_DISTRIBUTION_ID`

## 📖 Documentation

- **Quick Start**: Read `SETUP.md`
- **Detailed Config**: Read `aws-config.md`
- **Manual Deploy**: Edit and run `./deploy.sh`

## 🎨 Your Site Structure

```
/
├── index.html              # Homepage
├── 404.html               # Error page (NEW)
├── css/
│   └── styles.css
├── js/
│   └── script.js
├── images/
│   └── ...
├── services/
│   ├── index.html
│   ├── tree-trimming/
│   ├── tree-removal/
│   └── ...
├── locations/
│   ├── palmdale/
│   ├── lancaster/
│   └── ...
├── about/
│   └── index.html
└── contact/
    └── index.html
```

All paths use absolute URLs starting with `/` which works perfectly with S3/CloudFront!

## 💡 Why These Changes Matter

### Without CloudFront Function:
- ❌ `/services/` → 403 Access Denied
- ❌ `/about/` → 404 Not Found

### With CloudFront Function:
- ✅ `/services/` → Serves `/services/index.html`
- ✅ `/about/` → Serves `/about/index.html`

### Without Cache Headers:
- ⚠️ CloudFront uses default cache (24 hours)
- ⚠️ Content updates may not appear immediately

### With Cache Headers:
- ✅ HTML updates in 1 hour
- ✅ CSS/JS updates in 1 day
- ✅ Images cached for 1 year (faster loading)

## 🎯 Next Steps

1. **Read** `SETUP.md` for step-by-step instructions
2. **Configure** your AWS resources
3. **Create** the CloudFront Function (CRITICAL!)
4. **Add** GitHub secrets
5. **Deploy** using GitHub Actions or `./deploy.sh`
6. **Test** all URLs work correctly
7. **Update** DNS to point to CloudFront

## 📞 Questions?

Refer to the detailed guides:
- `SETUP.md` - Quick setup steps
- `aws-config.md` - Comprehensive AWS configuration

Your site is ready for S3 + CloudFront! 🚀
