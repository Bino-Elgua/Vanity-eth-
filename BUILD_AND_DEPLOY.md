# Build & Deploy Guide - Vanity-ETH Pro v3.0

## Quick Start (Development)

```bash
cd vanity-eth-pro
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Production Build

### Step 1: Install Dependencies
```bash
npm install
```

This will install:
- React 18.2.0
- Crypto libraries (@noble/*, bip39, bip32)
- UI components (qrcode.react, lucide-react, tailwindcss)
- Build tools (vite, postcss)

### Step 2: Build
```bash
npm run build
```

**Output**: `dist/` directory with optimized bundle
- HTML: index.html
- JavaScript: ~250KB gzipped (with all features)
- CSS: Tailwind-generated styles
- Static assets: images, fonts (if any)

### Step 3: Test Production Build Locally
```bash
npm run preview
```

Opens http://localhost:4173 with production build.

### Step 4: Deploy

Choose one:

#### Option A: Vercel (Recommended - 1 minute)
```bash
npm i -g vercel
vercel
# Follow prompts, auto-detects Vite project
```

#### Option B: GitHub Pages
```bash
# 1. Build
npm run build

# 2. Create gh-pages branch
git checkout --orphan gh-pages
git rm -rf .

# 3. Move dist contents to root
cp -r dist/* .
git add .
git commit -m "Deploy v3.0"
git push origin gh-pages

# 4. Enable GitHub Pages in repo settings
# Set source to gh-pages branch
```

#### Option C: Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Option D: Self-Hosted (Docker)
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t vanity-eth-pro .
docker run -p 8080:80 vanity-eth-pro
```

#### Option E: Traditional Web Server
```bash
# Build
npm run build

# Copy dist/ to web root
scp -r dist/* user@server:/var/www/html/vanity-eth-pro/

# Serve with nginx
```

Nginx config:
```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html/vanity-eth-pro;
    
    location / {
        try_files $uri /index.html;
    }
}
```

---

## Environment Setup

### Node.js Version Check
```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

### Install on Different Systems

**macOS (Homebrew)**
```bash
brew install node
```

**Ubuntu/Debian**
```bash
sudo apt-get install nodejs npm
```

**Windows**
```powershell
# Using Chocolatey
choco install nodejs

# Or download from nodejs.org
```

**Termux (Mobile/ARM)**
```bash
pkg install nodejs
npm install -g n
n lts  # Install latest LTS
```

---

## Build Optimization

### Current Bundle Size
- Minified + Gzip: ~250KB
- Uncompressed: ~800KB
- Load time: <2 seconds (typical)

### Reduce Further (Optional)
```bash
# Remove unused @noble modules if needed
npm remove @noble/schnorr  # If not using schnorr

# Or use dynamic imports in components
const { generateAddress } = await import('./utils/multichain')
```

---

## CI/CD Setup

### GitHub Actions (Auto-Deploy on Push)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### GitLab CI
Create `.gitlab-ci.yml`:

```yaml
pages:
  image: node:18
  script:
    - npm install
    - npm run build
  artifacts:
    paths:
      - dist
  only:
    - main
```

---

## Environment Variables (Optional)

If you add RPC endpoints or API keys, use `.env`:

```bash
# .env
VITE_ETH_RPC=https://eth.public.io
VITE_SOL_RPC=https://api.mainnet-beta.solana.com
VITE_BTC_API=https://blockstream.info/api
```

Access in code:
```javascript
const RPC = import.meta.env.VITE_ETH_RPC
```

**Important**: Never commit `.env` - add to `.gitignore`

---

## Troubleshooting

### Issue: "Cannot find module '@noble/secp256k1'"
**Solution**: Run `npm install` again
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 5173 already in use"
**Solution**: Kill process or use different port
```bash
npm run dev -- --port 3000
```

### Issue: "Cannot find module 'bs58'"
**Solution**: Install missing dependency
```bash
npm install bs58
```

### Issue: "vite: command not found"
**Solution**: Use npx
```bash
npx vite build
npx vite preview
```

### Issue: "TypeError: crypto.getRandomValues is not a function"
**Solution**: This error means code ran in Node.js instead of browser. Check bundling is correct.

### Issue: Build fails on low-memory systems
**Solution**: Increase memory
```bash
NODE_OPTIONS="--max_old_space_size=4096" npm run build
```

---

## Security Checklist Before Deployment

- [ ] No private keys in source code
- [ ] `.env` not committed to git
- [ ] HTTPS enabled on production server
- [ ] Content Security Policy headers set
- [ ] No telemetry/analytics code
- [ ] All crypto stays client-side
- [ ] No server logs contain sensitive data
- [ ] Update security headers:

```nginx
# nginx config
add_header X-Content-Type-Options "nosniff";
add_header X-Frame-Options "DENY";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "no-referrer";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'";
```

---

## Performance Tips

### Enable Caching
```nginx
location ~* \.(js|css|png|jpg|jpeg|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### Enable Compression
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_min_length 1000;
```

### CDN Integration
Use Cloudflare or similar:
1. Point domain to CDN
2. CDN caches static assets
3. Auto-minification & optimization
4. DDoS protection included

---

## Version Management

### Tag a Release
```bash
git tag -a v3.0 -m "Release: Multi-chain upgrade"
git push origin v3.0
```

### Semantic Versioning
- MAJOR.MINOR.PATCH
- v3.0.0 = major feature release
- v3.0.1 = bug fix
- v3.1.0 = new feature

---

## Monitoring (Optional)

### Browser Error Tracking
Add Sentry for production monitoring:

```bash
npm install @sentry/react @sentry/tracing
```

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://YOUR_SENTRY_DSN",
  environment: "production",
});
```

### Analytics (Privacy-Friendly)
Use Plausible or Fathom instead of Google Analytics:
- No cookies
- GDPR compliant
- Lightweight

---

## Rollback Plan

### If deployment fails:
```bash
# Revert to previous version
git revert HEAD
npm run build
npm run deploy  # redeploy
```

### Keep previous builds:
```bash
# Tag before deploying
git tag pre-v3.0 v2.0
git push --tags
```

---

## Maintenance

### Weekly Tasks
- Check for npm updates: `npm outdated`
- Review browser console for errors
- Test with latest browser versions

### Monthly Tasks
- Update dependencies: `npm update`
- Test all features in production
- Review security advisories: `npm audit`

### Security Updates
```bash
npm audit fix
git add package*.json
git commit -m "Security: fix vulnerabilities"
git push
# Redeploy
```

---

## Support

**Issues with build?** Check:
1. `node --version` >= 18
2. `npm install` completed without errors
3. No syntax errors: `npm run lint`
4. Browser DevTools console for JS errors

**Issues with deployment?** Check:
1. dist/ folder has index.html
2. Web server configured correctly
3. HTTPS/TLS enabled
4. CORS headers if needed
5. CSP allows wasm execution

---

## Final Checklist

Before going live:
- [ ] npm install completes
- [ ] npm run build succeeds
- [ ] npm run preview works locally
- [ ] All features tested (Multi-Chain, HD Wallet, Poison Radar, Export, Batch)
- [ ] Dark mode works
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] Private keys never logged
- [ ] Deployed to production
- [ ] HTTPS enabled
- [ ] Security headers set
- [ ] Team notified of launch

---

**You're ready to deploy! 🚀**

```
⚡ Vanity-ETH Pro v3.0
💎 Mirror Witness Seal
🔥 Code serves truth
```
