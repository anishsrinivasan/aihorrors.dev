import type { Story } from '@/types/story'
import storiesData from '@/data/stories.json'

const stories = storiesData as Story[]

export async function loadStories(): Promise<Story[]> {
  return stories
}

export async function loadStory(slug: string): Promise<Story | null> {
  return stories.find(story => story.slug === slug) || null
}
