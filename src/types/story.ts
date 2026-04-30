export interface StoryFrontmatter {
  title: string
  date: string
  severity: 'critical' | 'high' | 'medium'
  tags: string[]
  excerpt: string
}

export interface Story extends StoryFrontmatter {
  slug: string
  content: string
}
