import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import matter from 'gray-matter'

interface Story {
  slug: string
  title: string
  date: string
  severity: 'critical' | 'high' | 'medium'
  tags: string[]
  excerpt: string
  content: string
}

const storiesDir = join(process.cwd(), 'content/blogs')
const outputDir = join(process.cwd(), 'src/data')

// Create output directory if it doesn't exist
mkdirSync(outputDir, { recursive: true })

// Read all markdown files
const files = readdirSync(storiesDir).filter(file => file.endsWith('.md'))

const stories: Story[] = []

for (const file of files) {
  const filePath = join(storiesDir, file)
  const fileContent = readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)
  const slug = file.replace('.md', '')

  stories.push({
    slug,
    title: data.title,
    date: data.date,
    severity: data.severity,
    tags: data.tags || [],
    excerpt: data.excerpt || content.slice(0, 200) + '...',
    content
  })
}

// Sort by date (newest first)
stories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

// Write to JSON file
writeFileSync(
  join(outputDir, 'stories.json'),
  JSON.stringify(stories, null, 2)
)

console.log(`✅ Generated stories.json with ${stories.length} stories`)
