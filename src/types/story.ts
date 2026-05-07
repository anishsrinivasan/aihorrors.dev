export interface StoryFrontmatter {
  title: string
  date: string
  severity: 'critical' | 'high' | 'medium'
  tags: string[]
  excerpt: string
  image?: string
}

export interface Story extends StoryFrontmatter {
  slug: string
  content: string
}
