import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'
import { ImageResponse } from '@vercel/og'
import React from 'react'
import type { Story } from '../src/types/story'

const SITE_NAME = 'AI HORRORS'
const FONT_URL =
  'https://github.com/google/fonts/raw/main/ofl/archivoblack/ArchivoBlack-Regular.ttf'

const storiesPath = join(process.cwd(), 'src/data/stories.json')
const stories: Story[] = JSON.parse(readFileSync(storiesPath, 'utf-8'))

const cacheDir = join(process.cwd(), 'node_modules/.cache/og')
const outDir = join(process.cwd(), 'dist/og')
mkdirSync(cacheDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

async function loadFont(): Promise<ArrayBuffer> {
  const cached = join(cacheDir, 'ArchivoBlack-Regular.ttf')
  if (existsSync(cached)) {
    const buf = readFileSync(cached)
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  }
  console.log('  ↓ fetching Archivo Black font (one-time)...')
  const res = await fetch(FONT_URL)
  if (!res.ok) throw new Error(`font fetch failed: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(cached, buf)
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
}

function hashStory(story: Story): string {
  return createHash('sha1')
    .update(
      JSON.stringify({
        title: story.title,
        excerpt: story.excerpt,
        severity: story.severity,
        tags: story.tags,
        v: 2, // bump to invalidate every cached image (e.g. on template change)
      })
    )
    .digest('hex')
}

const BRAND_RED = '#ff3333'

const severityColor: Record<Story['severity'], string> = {
  critical: '#ff3333',
  high: '#ff6b35',
  medium: '#facc15',
}

const severityLabel: Record<Story['severity'], string> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
}

function renderOgJsx(story: Story) {
  const accent = severityColor[story.severity]
  const label = severityLabel[story.severity]
  const titleLength = story.title.length
  // Auto-fit: long titles get smaller font
  const titleSize = titleLength > 80 ? 56 : titleLength > 60 ? 64 : titleLength > 40 ? 76 : 88

  return React.createElement(
    'div',
    {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0a0a0a',
        backgroundImage:
          'radial-gradient(circle at 50% 50%, rgba(255,51,51,0.10) 0%, transparent 55%)',
        padding: '64px 80px',
        fontFamily: 'Archivo Black',
        color: '#f5f5f5',
        position: 'relative',
      },
    },
    // top accent stripe
    React.createElement('div', {
      style: { height: '6px', width: '100%', backgroundColor: accent, position: 'absolute', top: 0, left: 0 },
    }),
    // header row: brand + severity badge
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '24px',
        },
      },
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            fontSize: 36,
            color: BRAND_RED,
            letterSpacing: '-0.02em',
            textShadow: '0 0 30px rgba(255,51,51,0.55)',
          },
        },
        SITE_NAME
      ),
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            backgroundColor: accent,
            color: '#0a0a0a',
            fontSize: 22,
            padding: '10px 22px',
            letterSpacing: '0.1em',
          },
        },
        label
      )
    ),
    // story title
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          fontSize: titleSize,
          lineHeight: 1.05,
          letterSpacing: '-0.025em',
          marginTop: '40px',
          marginBottom: '40px',
        },
      },
      story.title
    ),
    // bottom row: tags + URL
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 22,
        },
      },
      React.createElement(
        'div',
        { style: { display: 'flex', flexWrap: 'wrap', gap: '12px', maxWidth: '70%' } },
        ...story.tags.slice(0, 5).map((tag) =>
          React.createElement(
            'div',
            {
              key: tag,
              style: {
                display: 'flex',
                color: accent,
                border: `2px solid ${accent}40`,
                padding: '6px 14px',
                fontSize: 18,
                letterSpacing: '0.08em',
              },
            },
            tag.toUpperCase()
          )
        )
      ),
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            color: BRAND_RED,
            fontSize: 28,
            letterSpacing: '-0.01em',
            textShadow: '0 0 24px rgba(255,51,51,0.5)',
          },
        },
        'aihorrors.dev'
      )
    )
  )
}

console.log(`🎨 Generating OG images for ${stories.length} stories...`)

const fontData = await loadFont()
let regenerated = 0
let cached = 0

for (const story of stories) {
  const hash = hashStory(story)
  const hashPath = join(cacheDir, `${story.slug}.hash`)
  const cachedPng = join(cacheDir, `${story.slug}.png`)
  const outPath = join(outDir, `${story.slug}.png`)

  const cacheHit =
    existsSync(hashPath) &&
    existsSync(cachedPng) &&
    readFileSync(hashPath, 'utf-8').trim() === hash

  if (cacheHit) {
    copyFileSync(cachedPng, outPath)
    console.log(`  ⚡ ${story.slug} (cached)`)
    cached++
    continue
  }

  const response = new ImageResponse(renderOgJsx(story), {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Archivo Black',
        data: fontData,
        weight: 400,
        style: 'normal',
      },
    ],
  })
  const buf = Buffer.from(await response.arrayBuffer())
  writeFileSync(outPath, buf)
  writeFileSync(cachedPng, buf)
  writeFileSync(hashPath, hash)
  console.log(`  ✓ ${story.slug} (${Math.round(buf.length / 1024)} KB)`)
  regenerated++
}

console.log(`✅ OG images: ${regenerated} regenerated, ${cached} from cache`)
