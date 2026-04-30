# Domain & Meta Tags Setup - aihorrors.dev

## ✅ Configuration Complete

### Domain Details
- **Primary Domain**: `aihorrors.dev`
- **GitHub Repository**: `https://github.com/anishsrinivasan/aihorrors.dev`
- **Twitter**: `@iamanish`
- **OG Image**: `public/og.png` ✅

### Files Updated

1. **`src/lib/constants.ts`**
   ```typescript
   url: 'https://aihorrors.dev'
   github: {
     url: 'https://github.com/anishsrinivasan/aihorrors.dev',
     owner: 'anishsrinivasan',
     repo: 'aihorrors.dev',
   }
   ```

2. **`index.html`**
   - Added canonical URL
   - Added OG URL
   - Added OG site name
   - Added Twitter creator/site
   - Added OG/Twitter image (`/og.png`)

3. **`scripts/ssr-prerender.tsx`**
   - Dynamic meta tags per route
   - Canonical URLs per page
   - OG images per page (`/og.png`)
   - Full SEO optimization

### Meta Tags (All Pages)

#### Homepage (`/`)
```html
<title>AI HORRORS - Real AI Disasters & Lessons Learned</title>
<meta name="description" content="Community-curated collection...">
<meta property="og:title" content="AI HORRORS - Real AI Disasters...">
<meta property="og:description" content="Community-curated...">
<meta property="og:url" content="https://aihorrors.dev">
<meta property="og:image" content="https://aihorrors.dev/og.png">
<meta property="og:site_name" content="AI HORRORS">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@iamanish">
<meta name="twitter:creator" content="@iamanish">
<meta name="twitter:title" content="AI HORRORS - Real AI Disasters...">
<meta name="twitter:description" content="Community-curated...">
<meta name="twitter:image" content="https://aihorrors.dev/og.png">
<link rel="canonical" href="https://aihorrors.dev">
```

#### Story Pages (`/story/[slug]`)
```html
<title>Cursor AI Agent Deletes Production Database | AI HORRORS</title>
<meta property="og:url" content="https://aihorrors.dev/story/railway-cursor">
<meta property="og:image" content="https://aihorrors.dev/og.png">
<link rel="canonical" href="https://aihorrors.dev/story/railway-cursor">
```

#### Contribute Page (`/contribute`)
```html
<title>Submit Your AI Horror Story | AI HORRORS</title>
<meta property="og:url" content="https://aihorrors.dev/contribute">
<meta property="og:image" content="https://aihorrors.dev/og.png">
<link rel="canonical" href="https://aihorrors.dev/contribute">
```

## Testing OG Tags

After deploying to Vercel:

1. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
   - Enter: `https://aihorrors.dev`
   - Verify card displays correctly with og.png

2. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
   - Enter: `https://aihorrors.dev`
   - Click "Scrape Again" to refresh cache

3. **OpenGraph Checker**: https://www.opengraph.xyz/
   - Enter: `https://aihorrors.dev`
   - Preview how it looks on social media

4. **LinkedIn Inspector**: https://www.linkedin.com/post-inspector/
   - Enter: `https://aihorrors.dev`
   - Check LinkedIn preview

## Deployment to Vercel

### Quick Deploy
```bash
# Install Vercel CLI
bun add -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

### Custom Domain Setup
```bash
# Add aihorrors.dev
vercel domains add aihorrors.dev
```

### DNS Configuration

Update at your domain registrar:

**Option 1: Nameservers (Recommended)**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Option 2: A Record**
```
Type: A
Name: @
Value: 76.76.21.21
```

**WWW subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## Post-Deploy Checklist

- [ ] Site loads at https://aihorrors.dev
- [ ] All routes work (/, /contribute, /story/*)
- [ ] OG image displays: https://aihorrors.dev/og.png
- [ ] Test social sharing with validators above
- [ ] Mobile responsive design verified

## SEO Checklist

✅ **Completed:**
- [x] Unique title per page
- [x] Unique description per page
- [x] Canonical URLs
- [x] OG tags (title, description, url, image)
- [x] Twitter Card tags
- [x] OG image (public/og.png)
- [x] Structured data (via pre-rendered HTML)
- [x] Semantic HTML
- [x] Pre-rendered content (SSR/SSG)

## Resources

- [SSR Setup](SSR_SETUP.md) - Technical SSR documentation
- [Deployment Guide](DEPLOYMENT.md) - Vercel deployment instructions
- [Content Structure](CONTENT_STRUCTURE.md) - Content workflow

---

**Status**: Ready for deployment 🚀
