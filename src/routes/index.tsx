import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { loadStories } from '@/lib/stories'
import type { Story } from '@/types/story'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: HomePage,
  loader: async () => ({
    stories: await loadStories(),
  }),
})

function HomePage() {
  const { stories: initialStories } = Route.useLoaderData()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const stories = initialStories

  const allTags = [...new Set(stories.flatMap(s => s.tags || []))]

  const filteredStories = selectedTag
    ? stories.filter(s => s.tags?.includes(selectedTag))
    : stories

  return (
    <>
      {/* Compact Hero - No huge viewport */}
      <section className="relative border-b border-horror-red/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-horror-gray/30 to-horror-black" />

        <div className="container mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-12 relative z-10">
          <div className="max-w-4xl">
            {/* Compact badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-horror-red/50 bg-horror-red/10 backdrop-blur-sm mb-4 text-xs">
              <svg className="w-3 h-3 text-horror-red" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-bold uppercase tracking-wider text-horror-red">Production Incident Database</span>
            </div>

            {/* Compact headline */}
            <h1 className="font-display text-3xl md:text-5xl uppercase leading-tight mb-3 tracking-tighter">
              <span className="text-gray-100">When AI </span>
              <span className="text-horror-red">Goes Wrong</span>
            </h1>

            {/* Compact description */}
            <p className="text-sm md:text-base text-gray-400 mb-6 leading-relaxed max-w-2xl">
              Real production disasters, deleted databases, and security breaches. <span className="text-gray-300 font-medium">Every horror story is a lesson learned.</span>
            </p>

            {/* Inline stats */}
            <div className="flex flex-wrap items-center gap-6 text-xs md:text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-horror-red font-display text-xl">{stories.length}</span>
                <span className="uppercase tracking-wider">Incidents</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-horror-orange font-display text-xl">{stories.filter(s => s.severity === 'critical').length}</span>
                <span className="uppercase tracking-wider">Critical</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar - Compact */}
      {allTags.length > 0 && (
        <section className="sticky top-[73px] md:top-[81px] z-40 border-b border-horror-red/20 bg-horror-black/95 backdrop-blur-xl py-4">
          <div className="container mx-auto max-w-6xl px-4 md:px-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
              <span className="text-xs uppercase tracking-wider text-gray-600 font-bold mr-2 flex-shrink-0">Filter:</span>
              <button
                onClick={() => setSelectedTag(null)}
                className={cn(
                  "px-3 py-1.5 text-xs uppercase font-bold tracking-wider transition-all flex-shrink-0",
                  !selectedTag
                    ? "bg-horror-red text-horror-black"
                    : "bg-horror-gray border border-horror-red/30 text-gray-400 hover:text-white hover:border-horror-red/60"
                )}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={cn(
                    "px-3 py-1.5 text-xs uppercase font-bold tracking-wider transition-all flex-shrink-0",
                    selectedTag === tag
                      ? "bg-horror-red text-horror-black"
                      : "bg-horror-gray border border-horror-red/30 text-gray-400 hover:text-white hover:border-horror-red/60"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stories List - Calendar Date Format like ServerlessHorrors */}
      <section className="container mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-12">
        {filteredStories.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-4 border border-horror-orange/30 bg-horror-orange/5 rounded mb-4">
              <svg className="w-12 h-12 text-horror-orange mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="font-display text-3xl text-horror-orange mb-3">No Stories Found</h2>
            <p className="text-gray-400 mb-6">Be the first to submit an AI horror story!</p>
            <Link
              to="/contribute"
              className="inline-block px-6 py-3 bg-horror-red hover:bg-horror-orange text-horror-black font-bold uppercase tracking-wider transition-all"
            >
              Submit Story
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredStories.map((story, index) => (
              <StoryRow key={story.slug} story={story} index={index} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function StoryRow({ story, index }: { story: Story; index: number }) {
  // Parse date
  const date = new Date(story.date)
  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const day = date.getDate()

  const severityConfig = {
    critical: {
      color: 'bg-horror-red text-horror-black',
      badge: 'CRITICAL',
      icon: '🔴'
    },
    high: {
      color: 'bg-horror-orange text-horror-black',
      badge: 'HIGH',
      icon: '🟠'
    },
    medium: {
      color: 'bg-yellow-400 text-horror-black',
      badge: 'MEDIUM',
      icon: '🟡'
    }
  }

  const config = severityConfig[story.severity]

  return (
    <Link
      to="/story/$slug"
      params={{ slug: story.slug }}
      className="group flex items-start gap-4 md:gap-6 p-4 md:p-6 border-b border-horror-red/10 hover:bg-horror-red/5 hover:border-horror-red/30 transition-all"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Calendar Date Block - Prominent like ServerlessHorrors */}
      <div className="flex-shrink-0 w-14 md:w-16 text-center">
        <div className="bg-horror-gray border border-horror-red/30 group-hover:border-horror-red/60 transition-colors">
          <div className="bg-horror-red text-horror-black text-xs font-bold uppercase tracking-wider py-1 px-2">
            {month}
          </div>
          <div className="py-2 md:py-3">
            <div className="font-display text-2xl md:text-3xl text-gray-100 group-hover:text-horror-red transition-colors">
              {day}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Severity Badge */}
        {story.severity && (
          <div className="mb-2">
            <span className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider",
              config.color
            )}>
              <span>{config.icon}</span>
              <span>{config.badge}</span>
            </span>
          </div>
        )}

        {/* Title */}
        <h2 className="font-display text-xl md:text-2xl mb-2 text-gray-100 group-hover:text-horror-red transition-colors leading-tight tracking-tight">
          {story.title}
        </h2>

        {/* Excerpt */}
        <p className="text-sm md:text-base text-gray-400 mb-3 leading-relaxed line-clamp-2">
          {story.excerpt}
        </p>

        {/* Tags */}
        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {story.tags.map(tag => (
              <span
                key={tag}
                className="bg-horror-orange/20 text-horror-orange border border-horror-orange/30 px-2 py-0.5 text-xs uppercase tracking-wider font-bold"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Arrow indicator */}
      <div className="flex-shrink-0 hidden md:block">
        <svg
          className="w-6 h-6 text-horror-red opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
