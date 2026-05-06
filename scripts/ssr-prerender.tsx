import React from 'react'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { renderToString } from 'react-dom/server'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from '../src/routeTree.gen'
import type { Story } from '../src/types/story'
import { GITHUB_URL, TWITTER_URL } from '../src/lib/constants'

const storiesPath = join(process.cwd(), 'src/data/stories.json')
const stories: Story[] = JSON.parse(readFileSync(storiesPath, 'utf-8'))

const distPath = join(process.cwd(), 'dist')
const templatePath = join(distPath, 'index.html')
const template = readFileSync(templatePath, 'utf-8')

const SITE_URL = 'https://aihorrors.dev'
const SITE_NAME = 'AI HORRORS'
const SITE_DESCRIPTION =
  'Real AI disasters from production: Cursor deleting databases in 9 seconds, Replit wiping prod, Antigravity nuking entire drives. Community-curated cautionary tales for engineers shipping AI.'
const ORGANIZATION = {
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/og.png`,
  sameAs: [GITHUB_URL, TWITTER_URL],
}

type RouteType = 'home' | 'page' | 'story'

interface RouteSpec {
  path: string
  type: RouteType
  meta: {
    title: string
    description: string
    url: string
    image: string
  }
  story?: Story
}

const routes: RouteSpec[] = [
  {
    path: '/',
    type: 'home',
    meta: {
      title: 'AI HORRORS — Real AI Disasters & Production Horror Stories',
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      image: `${SITE_URL}/og.png`,
    },
  },
  {
    path: '/contribute',
    type: 'page',
    meta: {
      title: 'Submit Your AI Horror Story | AI HORRORS',
      description:
        'Share your AI disaster story with the community. Help engineers learn from real production failures with AI agents, copilots, and autonomous tools.',
      url: `${SITE_URL}/contribute`,
      image: `${SITE_URL}/og.png`,
    },
  },
]

stories.forEach((story) => {
  const ogImage = existsSync(join(distPath, 'og', `${story.slug}.png`))
    ? `${SITE_URL}/og/${story.slug}.png`
    : `${SITE_URL}/og.png`

  routes.push({
    path: `/story/${story.slug}`,
    type: 'story',
    story,
    meta: {
      title: `${story.title} | AI HORRORS`,
      description: story.excerpt,
      url: `${SITE_URL}/story/${story.slug}`,
      image: ogImage,
    },
  })
})

console.log(`📄 Pre-rendering ${routes.length} routes with SSR...`)

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toIso(date: string): string {
  // frontmatter dates are "YYYY-MM-DD"; expand to full ISO at midnight UTC for consistency
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return `${date}T00:00:00.000Z`
  return new Date(date).toISOString()
}

function buildJsonLd(route: RouteSpec): unknown[] {
  if (route.type === 'home') {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        alternateName: 'aihorrors.dev',
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: 'en',
        publisher: ORGANIZATION,
      },
      {
        '@context': 'https://schema.org',
        ...ORGANIZATION,
        description: SITE_DESCRIPTION,
      },
    ]
  }

  if (route.type === 'story' && route.story) {
    const story = route.story
    const published = toIso(story.date)
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: story.title,
        description: story.excerpt,
        image: route.meta.image,
        datePublished: published,
        dateModified: published,
        author: ORGANIZATION,
        publisher: {
          ...ORGANIZATION,
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/og.png` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': route.meta.url },
        articleSection: 'AI Incidents',
        keywords: story.tags.join(', '),
        inLanguage: 'en',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: story.title, item: route.meta.url },
        ],
      },
    ]
  }

  return []
}

function buildHeadInjections(route: RouteSpec): string {
  const parts: string[] = []

  if (route.type === 'story' && route.story) {
    const published = toIso(route.story.date)
    parts.push(`<meta property="article:published_time" content="${published}">`)
    parts.push(`<meta property="article:modified_time" content="${published}">`)
    parts.push(`<meta property="article:author" content="${SITE_NAME}">`)
    parts.push(`<meta property="article:section" content="AI Incidents">`)
    for (const tag of route.story.tags) {
      parts.push(`<meta property="article:tag" content="${escapeHtml(tag)}">`)
    }
  }

  const jsonLd = buildJsonLd(route)
  if (jsonLd.length > 0) {
    parts.push(
      `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`
    )
  }

  return parts.join('\n    ')
}

async function renderRoute(route: RouteSpec) {
  try {
    const history = createMemoryHistory({ initialEntries: [route.path] })
    const router = createRouter({ routeTree, history })

    await router.load()

    const app = renderToString(React.createElement(RouterProvider, { router }))

    let html = template

    html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(route.meta.title)}</title>`)
    html = html.replace(
      /<meta name="description" content=".*?"[^>]*>/,
      `<meta name="description" content="${escapeHtml(route.meta.description)}">`
    )
    html = html.replace(
      /<meta property="og:title" content=".*?"[^>]*>/,
      `<meta property="og:title" content="${escapeHtml(route.meta.title)}">`
    )
    html = html.replace(
      /<meta property="og:description" content=".*?"[^>]*>/,
      `<meta property="og:description" content="${escapeHtml(route.meta.description)}">`
    )
    html = html.replace(
      /<meta property="og:url" content=".*?"[^>]*>/,
      `<meta property="og:url" content="${route.meta.url}">`
    )
    html = html.replace(
      /<meta property="og:type" content=".*?"[^>]*>/,
      `<meta property="og:type" content="${route.type === 'story' ? 'article' : 'website'}">`
    )
    html = html.replace(
      /<meta name="twitter:title" content=".*?"[^>]*>/,
      `<meta name="twitter:title" content="${escapeHtml(route.meta.title)}">`
    )
    html = html.replace(
      /<meta name="twitter:description" content=".*?"[^>]*>/,
      `<meta name="twitter:description" content="${escapeHtml(route.meta.description)}">`
    )
    html = html.replace(
      /<link rel="canonical" href=".*?"[^>]*>/,
      `<link rel="canonical" href="${route.meta.url}">`
    )
    html = html.replace(
      /<meta property="og:image" content=".*?"[^>]*>/,
      `<meta property="og:image" content="${route.meta.image}">`
    )
    html = html.replace(
      /<meta name="twitter:image" content=".*?"[^>]*>/,
      `<meta name="twitter:image" content="${route.meta.image}">`
    )

    const injections = buildHeadInjections(route)
    if (injections) {
      html = html.replace('</head>', `    ${injections}\n  </head>`)
    }

    html = html.replace('<div id="root"></div>', `<div id="root">${app}</div>`)

    const routePath = route.path === '/' ? '/index' : route.path
    const filePath = join(distPath, `${routePath}.html`)
    const dir = filePath.substring(0, filePath.lastIndexOf('/'))

    mkdirSync(dir, { recursive: true })
    writeFileSync(filePath, html)

    console.log(`  ✓ ${route.path}`)
  } catch (error) {
    console.error(`  ✗ ${route.path}:`, (error as Error).message)
  }
}

async function render404() {
  const history = createMemoryHistory({ initialEntries: ['/__not_found__'] })
  const router = createRouter({ routeTree, history })
  await router.load()
  const app = renderToString(React.createElement(RouterProvider, { router }))

  const meta = {
    title: 'Page Not Found | AI HORRORS',
    description: 'The story you are looking for does not exist or was moved. Browse all incidents at aihorrors.dev.',
    url: `${SITE_URL}/404`,
    image: `${SITE_URL}/og.png`,
  }

  let html = template
  html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)
  html = html.replace(
    /<meta name="description" content=".*?"[^>]*>/,
    `<meta name="description" content="${escapeHtml(meta.description)}">`
  )
  html = html.replace(
    /<meta name="robots" content=".*?"[^>]*>/,
    `<meta name="robots" content="noindex, follow">`
  )
  html = html.replace(
    /<meta property="og:title" content=".*?"[^>]*>/,
    `<meta property="og:title" content="${escapeHtml(meta.title)}">`
  )
  html = html.replace(
    /<meta property="og:description" content=".*?"[^>]*>/,
    `<meta property="og:description" content="${escapeHtml(meta.description)}">`
  )
  html = html.replace(
    /<meta property="og:url" content=".*?"[^>]*>/,
    `<meta property="og:url" content="${meta.url}">`
  )
  html = html.replace(
    /<meta name="twitter:title" content=".*?"[^>]*>/,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}">`
  )
  html = html.replace(
    /<meta name="twitter:description" content=".*?"[^>]*>/,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}">`
  )
  html = html.replace(
    /<link rel="canonical" href=".*?"[^>]*>/,
    `<link rel="canonical" href="${SITE_URL}/">`
  )
  html = html.replace('<div id="root"></div>', `<div id="root">${app}</div>`)

  writeFileSync(join(distPath, '404.html'), html)
}

function buildSitemap(): string {
  const lastmodForHome = stories.length > 0 ? toIso(stories[0].date) : new Date().toISOString()
  const entries = routes
    .map((route) => {
      const lastmod =
        route.type === 'story' && route.story
          ? toIso(route.story.date)
          : route.path === '/'
            ? lastmodForHome
            : new Date().toISOString()
      const priority = route.path === '/' ? '1.0' : route.type === 'story' ? '0.8' : '0.5'
      const changefreq = route.path === '/' ? 'daily' : route.type === 'story' ? 'monthly' : 'yearly'
      return `  <url>
    <loc>${route.meta.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`
}

function buildLlmsTxt(): string {
  const storyLines = stories
    .map((story) => {
      const url = `${SITE_URL}/story/${story.slug}`
      return `- [${story.title}](${url}): ${story.excerpt}`
    })
    .join('\n')

  return `# AI HORRORS

> ${SITE_DESCRIPTION}

AI HORRORS is a community-curated archive of real AI production failures. Each story documents what happened, the timeline, root causes, and lessons learned. The archive focuses on AI coding agents, autonomous tools, and LLM-driven systems that caused measurable damage in production.

## Stories
${storyLines}

## Submit
- [Submit your AI horror story](${SITE_URL}/contribute): Share an AI disaster you witnessed or experienced.

## Optional
- [RSS feed](${SITE_URL}/feed.xml): Full-content RSS for the entire archive.
- [Sitemap](${SITE_URL}/sitemap.xml): All indexable URLs.
`
}

function buildRssFeed(): string {
  const lastBuildDate = new Date().toUTCString()
  const items = stories
    .map((story) => {
      const url = `${SITE_URL}/story/${story.slug}`
      const pubDate = new Date(toIso(story.date)).toUTCString()
      return `    <item>
      <title>${escapeXml(story.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(story.excerpt)}</description>
      <content:encoded><![CDATA[${story.content}]]></content:encoded>
      <author>noreply@aihorrors.dev (AI HORRORS)</author>
${story.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join('\n')}
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>aihorrors.dev build</generator>
${items}
  </channel>
</rss>
`
}

for (const route of routes) {
  await renderRoute(route)
}

await render404()
console.log(`  ✓ /404.html`)

writeFileSync(join(distPath, 'sitemap.xml'), buildSitemap())
console.log(`  ✓ /sitemap.xml`)

writeFileSync(join(distPath, 'feed.xml'), buildRssFeed())
console.log(`  ✓ /feed.xml`)

writeFileSync(join(distPath, 'llms.txt'), buildLlmsTxt())
console.log(`  ✓ /llms.txt`)

console.log(`✅ Pre-rendered ${routes.length} routes + 404 + sitemap + RSS + llms.txt`)
