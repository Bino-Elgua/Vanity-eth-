# CloakSeed - Deployment Guide

Complete instructions for deploying CloakSeed to production.

---

## 📋 Pre-Deployment Checklist

- [ ] Run `npm run build` and verify no errors
- [ ] Test locally with `npm run preview`
- [ ] Review all environment variables
- [ ] Update version in `package.json`
- [ ] Create changelog entry
- [ ] Test on mobile device
- [ ] Verify PWA manifest
- [ ] Compress assets

---

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended)

**Pros**: Auto-deploys on push, free tier, edge caching, analytics

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Or connect GitHub for auto-deploy
```

**Create `vercel.json`:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_STRIPE_PUBLIC_KEY": "@STRIPE_PUBLIC_KEY"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "no-referrer"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, immutable"
        }
      ]
    }
  ]
}
```

### Option 2: Netlify

**Pros**: Drag-and-drop, Git integration, serverless functions

```bash
# Build locally
npm run build

# Deploy via CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist

# Or drag dist/ folder to Netlify drop zone
```

**Create `netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[context.production.environment]
  VITE_STRIPE_PUBLIC_KEY = ""

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "no-referrer"
    Cache-Control = "public, max-age=3600, immutable"
```

### Option 3: GitHub Pages

**Pros**: Free, built-in to GitHub, no external dependencies

```bash
# Build
npm run build

# Deploy (using gh-pages package)
npm install --save-dev gh-pages

# Update package.json:
# "homepage": "https://yourusername.github.io/cloakseed",
# "deploy": "gh-pages -d dist"

npm run deploy
```

### Option 4: Cloudflare Pages

**Pros**: Fast, free tier, DDoS protection, Workers support

```bash
# Via CLI
npm install -g wrangler
wrangler pages deploy dist

# Or connect GitHub for auto-deploy
# https://pages.cloudflare.com
```

### Option 5: Self-Hosted (Docker)

**Pros**: Full control, can run anywhere, offline capable

```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Create `nginx.conf`:**
```nginx
server {
  listen 80;
  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }
  
  # Security headers
  add_header X-Content-Type-Options "nosniff";
  add_header X-Frame-Options "DENY";
  add_header X-XSS-Protection "1; mode=block";
  add_header Referrer-Policy "no-referrer";
  add_header Cache-Control "public, max-age=3600, immutable";
  
  # Compress responses
  gzip on;
  gzip_types text/plain text/css text/javascript application/json;
}
```

**Build and run:**
```bash
docker build -t cloakseed .
docker run -p 80:80 cloakseed
```

### Option 6: AWS S3 + CloudFront

**Pros**: Scalable, CDN, enterprise-grade

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E123456 --paths "/*"
```

---

## 🔐 Security Hardening

### Environment Variables

Create `.env.production`:
```env
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

**Never commit secrets.** Use platform-specific secret management:
- Vercel: Settings → Environment Variables
- Netlify: Site Settings → Build & Deploy → Environment
- GitHub: Settings → Secrets & Variables

### Headers to Set

All deployments should include these security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer
Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### TLS/SSL

- **Minimum**: TLS 1.2
- **Recommended**: TLS 1.3
- **Certificate**: Let's Encrypt (free)
- **HSTS**: `Strict-Transport-Security: max-age=31536000; includeSubDomains`

---

## 📊 Monitoring & Analytics

### Error Tracking

**Sentry** (recommended for production):

```bash
npm install @sentry/react @sentry/tracing
```

Add to `src/main.jsx`:
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  release: process.env.VITE_APP_VERSION,
});
```

### Analytics (Privacy-Respecting)

Use **Plausible** or **Fathom** (no cookies, GDPR-compliant):

```html
<!-- In index.html -->
<script defer data-domain="cloakseed.com" src="https://plausible.io/js/script.js"></script>
```

**Never use Google Analytics** with crypto apps (potential surveillance risk).

### Uptime Monitoring

Use **StatusPage.io** or **Uptime Robot** (free tier):
- Monitor `/` endpoint
- Check every 5 minutes
- Alert on downtime

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Recommended)

**Create `.github/workflows/deploy.yml`:**
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main, develop]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Testing in CI

```yaml
      - run: npm run lint
      - run: npm run test
```

---

## 📈 Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm install -D rollup-plugin-visualizer
npm run build -- --analyze
```

### Image Optimization

- Use WebP format with fallbacks
- Lazy-load non-critical images
- Compress SVGs

### Code Splitting

Already configured in `vite.config.js`:
- React vendor (separate chunk)
- Crypto libraries (separate chunk)
- UI libraries (separate chunk)

### Caching

Set aggressive cache for versioned assets:
```
Cache-Control: public, max-age=31536000, immutable
```

Set no-cache for HTML:
```
Cache-Control: public, max-age=0, must-revalidate
```

---

## 🌍 Global Deployment

### CDN Considerations

**Recommended**: Vercel or CloudFlare (edge nodes globally)

**GeoIP Blocking**: (Optional) Block certain regions:
```javascript
// In API route or edge function
const blocked = ['XX', 'YY']; // ISO country codes
if (blocked.includes(req.geo?.country?.code)) {
  return res.status(403).json({ error: 'Access denied' });
}
```

### Regional Compliance

- **GDPR** (EU): No tracking, honor DNT headers
- **CCPA** (California): No third-party tracking
- **Other**: Review local regulations

---

## 🚨 Post-Deployment

### Smoke Tests

After deploying, verify:
1. Homepage loads
2. Cipher generation works
3. Restore flow works
4. QR codes render
5. Offline mode works
6. PWA installs
7. No console errors
8. Performance > 80 on Lighthouse

### Lighthouse Check

```bash
npx lighthouse https://cloakseed.com
```

Target scores:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 95
- SEO: > 90

### Monitoring

- Set up Sentry alerts
- Monitor error rates
- Track page load times
- Watch for security issues

---

## 📝 Versioning & Updates

### Semantic Versioning

```
major.minor.patch

v1.0.0     - Initial release
v1.1.0     - New feature (minor)
v1.1.1     - Bug fix (patch)
v2.0.0     - Breaking change (major)
```

### Changelog

Maintain `CHANGELOG.md`:
```markdown
## v1.1.0 (2025-02-XX)

### Added
- Panic phrase generator
- Encrypted export feature

### Fixed
- Clipboard zeroization timing

### Security
- Updated dependencies
```

### Zero-Downtime Deployments

1. Deploy new version
2. Run smoke tests
3. Switch traffic gradually (canary)
4. Monitor metrics
5. Rollback if issues (blue-green)

---

## 🔍 Troubleshooting

### Common Issues

**Build fails:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Port in use:**
```bash
# Find and kill process using port 5173
lsof -i :5173
kill -9 <PID>
```

**Module not found:**
```bash
# Check package.json and install
npm install
npm run build
```

---

## 📞 Support

- **Docs**: README.md, CLOAKSEED_README.md
- **Issues**: GitHub Issues
- **Security**: security@cloakseed.dev

---

*Last updated: 2025-01-XX*
