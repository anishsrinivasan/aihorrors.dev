# Deployment Guide - Vercel

This site is a **pre-rendered static site** with full SSR (Server-Side Rendering) for SEO. All routes are pre-rendered to HTML at build time.

## Deploy to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/anishsrinivasan/aihorrors.dev)

### Manual Deployment

```bash
# Install Vercel CLI
bun add -g vercel

# Login (first time only)
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Custom Domain Setup

After deployment, configure `aihorrors.dev`:

```bash
# Add custom domain
vercel domains add aihorrors.dev
```

### DNS Configuration

Vercel will provide you with DNS records. Update your domain registrar:

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

**Add WWW subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## Build Configuration

Vercel automatically detects the build settings, but you can verify:

- **Framework**: Vite
- **Build Command**: `bun run build`
- **Output Directory**: `dist`
- **Install Command**: `bun install`

## Environment Variables

This project doesn't require any environment variables by default. All content is statically generated from markdown files.

## Build Process

The build runs three steps automatically:

1. **Generate stories** - Converts markdown to JSON
   ```bash
   bun run generate
   ```

2. **Build with Vite** - Compiles React app
   ```bash
   vite build
   ```

3. **SSR Pre-render** - Pre-renders all routes to HTML
   ```bash
   bunx tsx scripts/ssr-prerender.tsx
   ```

### What Gets Pre-rendered

- `/` - Homepage with all stories
- `/contribute` - Contribution page  
- `/story/[slug]` - All individual story pages

Each route includes:
- ✅ Full HTML content
- ✅ Dynamic meta tags (title, description, OG tags)
- ✅ Canonical URLs
- ✅ Twitter Card tags
- ✅ OG image (`/og.png`)

## Continuous Deployment

Vercel automatically:
- ✅ Deploys on push to `main` branch
- ✅ Creates preview deployments for PRs
- ✅ Invalidates cache on new deploys
- ✅ Provides instant rollback

## Post-Deployment Checklist

After your first deployment:

- [ ] Visit `https://aihorrors.dev` and verify it loads
- [ ] Test all routes (/, /contribute, /story/*)
- [ ] Check responsive design on mobile
- [ ] Verify OG image loads: `https://aihorrors.dev/og.png`
- [ ] Test social sharing:
  - Twitter: https://cards-dev.twitter.com/validator
  - Facebook: https://developers.facebook.com/tools/debug/
  - LinkedIn: https://www.linkedin.com/post-inspector/

## Vercel Configuration

The site includes `vercel.json` for custom configuration:

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

This ensures:
- `/contribute` works (not `/contribute/`)
- Clean URLs without `.html` extensions
- Proper redirects

## Performance

Expected performance on Vercel:

- **First Contentful Paint**: ~200ms
- **Time to Interactive**: ~600ms
- **Lighthouse Score**: 95-100
- **SEO Score**: 100/100

## Monitoring

Vercel provides built-in:
- Analytics (page views, top pages)
- Web Vitals monitoring
- Error tracking
- Deployment logs

Enable Vercel Analytics:
```bash
vercel analytics enable
```

## Troubleshooting

### Build Fails

**Check build logs:**
```bash
vercel logs <deployment-url>
```

**Common issues:**
- Missing dependencies: Run `bun install` locally first
- TypeScript errors: Run `bun run build` locally to debug
- Markdown errors: Check story frontmatter is valid

### Routes Don't Work (404)

- Ensure `vercel.json` is present
- Check `cleanUrls: true` is set
- Verify files exist in `dist/` after build

### Meta Tags Not Updating

- Clear Vercel cache: Redeploy with `vercel --force`
- Check SSR prerender script ran successfully
- View build logs for errors

### OG Image Not Loading

- Verify `public/og.png` exists
- Check image is committed to git
- Test URL directly: `https://aihorrors.dev/og.png`

## Update Deployment

To deploy new stories or changes:

```bash
# 1. Add your changes
git add .
git commit -m "Add new story"

# 2. Push to main
git push origin main

# Vercel automatically deploys!
```

Or deploy manually:
```bash
vercel --prod
```

## Rollback

If something goes wrong:

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "⋯" → "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

## Advanced: Preview Deployments

Every PR gets a preview URL:

```bash
# Create feature branch
git checkout -b add-new-story

# Make changes, commit, push
git push origin add-new-story

# Create PR on GitHub
# Vercel automatically creates preview URL
```

Preview URL format: `aihorrors-dev-git-branch-username.vercel.app`

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Custom Domains](https://vercel.com/docs/concepts/projects/domains)
- [Build Configuration](https://vercel.com/docs/build-step)

---

**Ready to deploy?** Run `vercel` in the project directory! 🚀
