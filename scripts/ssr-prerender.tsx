import React from 'react'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { renderToString } from 'react-dom/server'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from '../src/routeTree.gen'
import type { Story } from '../src/types/story'

// Read generated stories
const storiesPath = join(process.cwd(), 'src/data/stories.json')
const stories: Story[] = JSON.parse(readFileSync(storiesPath, 'utf-8'))

// Read the built index.html template
const distPath = join(process.cwd(), 'dist')
const templatePath = join(distPath, 'index.html')
const template = readFileSync(templatePath, 'utf-8')

// Site config
const SITE_URL = 'https://aihorrors.dev'
const SITE_NAME = 'AI HORRORS'
const TWITTER_HANDLE = '@iamanish'

// Routes to pre-render
const routes = [
  {
    path: '/',
    meta: {
      title: 'AI HORRORS - Real AI Disasters & Lessons Learned',
      description: 'Community-curated collection of real AI failures, production disasters, and cautionary tales.',
      url: SITE_URL,
      image: `${SITE_URL}/og.png`
    }
  },
  {
    path: '/contribute',
    meta: {
      title: 'Submit Your AI Horror Story | AI HORRORS',
      description: 'Share your AI disaster story with the community. Help others learn from real production failures.',
      url: `${SITE_URL}/contribute`,
      image: `${SITE_URL}/og.png`
    }
  },
]

// Add story routes
stories.forEach(story => {
  routes.push({
    path: `/story/${story.slug}`,
    meta: {
      title: `${story.title} | AI HORRORS`,
      description: story.excerpt,
      url: `${SITE_URL}/story/${story.slug}`,
      image: `${SITE_URL}/og.png`
    }
  })
})

console.log(`📄 Pre-rendering ${routes.length} routes with SSR...`)

async function renderRoute(route: typeof routes[0]) {
  try {
    // Create router with memory history
    const history = createMemoryHistory({ initialEntries: [route.path] })
    const router = createRouter({ routeTree, history })

    // Load route
    await router.load()

    // Render to string
    const app = renderToString(
      React.createElement(RouterProvider, { router })
    )

    let html = template

    // Replace title
    html = html.replace(/<title>.*?<\/title>/, `<title>${route.meta.title}</title>`)

    // Replace or add meta tags
    html = html.replace(/<meta name="description" content=".*?"[^>]*>/, `<meta name="description" content="${route.meta.description}">`)
    html = html.replace(/<meta property="og:title" content=".*?"[^>]*>/, `<meta property="og:title" content="${route.meta.title}">`)
    html = html.replace(/<meta property="og:description" content=".*?"[^>]*>/, `<meta property="og:description" content="${route.meta.description}">`)
    html = html.replace(/<meta property="og:url" content=".*?"[^>]*>/, `<meta property="og:url" content="${route.meta.url}">`)
    html = html.replace(/<meta name="twitter:title" content=".*?"[^>]*>/, `<meta name="twitter:title" content="${route.meta.title}">`)
    html = html.replace(/<meta name="twitter:description" content=".*?"[^>]*>/, `<meta name="twitter:description" content="${route.meta.description}">`)
    html = html.replace(/<link rel="canonical" href=".*?"[^>]*>/, `<link rel="canonical" href="${route.meta.url}">`)

    // Add OG image if not present
    if (!html.includes('<meta property="og:image"')) {
      html = html.replace('</head>', `  <meta property="og:image" content="${route.meta.image}">\n  <meta name="twitter:image" content="${route.meta.image}">\n  </head>`)
    } else {
      html = html.replace(/<meta property="og:image" content=".*?"[^>]*>/, `<meta property="og:image" content="${route.meta.image}">`)
      html = html.replace(/<meta name="twitter:image" content=".*?"[^>]*>/, `<meta name="twitter:image" content="${route.meta.image}">`)
    }

    // Inject rendered HTML
    html = html.replace('<div id="root"></div>', `<div id="root">${app}</div>`)

    // Create directory structure
    const routePath = route.path === '/' ? '/index' : route.path
    const filePath = join(distPath, `${routePath}.html`)
    const dir = filePath.substring(0, filePath.lastIndexOf('/'))

    mkdirSync(dir, { recursive: true })
    writeFileSync(filePath, html)

    console.log(`  ✓ ${route.path}`)
  } catch (error) {
    console.error(`  ✗ ${route.path}:`, error.message)
  }
}

// Render all routes sequentially
for (const route of routes) {
  await renderRoute(route)
}

console.log(`✅ Pre-rendered ${routes.length} routes with SSR`)
