import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'
import { loadStories, loadStory } from '@/lib/stories'
import type { Story } from '@/types/story'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/story/$slug')({
  component: StoryPage,
  loader: async ({ params }) => {
    const [story, allStories] = await Promise.all([loadStory(params.slug), loadStories()])
    if (!story) {
      throw notFound()
    }
    return { story, related: pickRelated(story, allStories, 3) }
  },
})

function pickRelated(current: Story, all: Story[], limit: number): Story[] {
  const others = all.filter((s) => s.slug !== current.slug)
  const currentTags = new Set(current.tags ?? [])
  const scored = others
    .map((s) => ({
      story: s,
      overlap: (s.tags ?? []).filter((t) => currentTags.has(t)).length,
      time: new Date(s.date).getTime(),
    }))
    .sort((a, b) => b.overlap - a.overlap || b.time - a.time)
  return scored.slice(0, limit).map((entry) => entry.story)
}

function StoryPage() {
  const { story, related } = Route.useLoaderData()

  const severityConfig = {
    critical: {
      color: 'bg-horror-red text-horror-black',
      border: 'border-horror-red',
      glow: 'shadow-[0_0_40px_rgba(255,51,51,0.4)]',
      icon: '🔴',
      label: 'CRITICAL'
    },
    high: {
      color: 'bg-horror-orange text-horror-black',
      border: 'border-horror-orange',
      glow: 'shadow-[0_0_40px_rgba(255,107,53,0.4)]',
      icon: '🟠',
      label: 'HIGH'
    },
    medium: {
      color: 'bg-yellow-400 text-horror-black',
      border: 'border-yellow-400',
      glow: 'shadow-[0_0_40px_rgba(250,204,21,0.4)]',
      icon: '🟡',
      label: 'MEDIUM'
    }
  }

  const config = severityConfig[story.severity]

  return (
    <>
      <article className="relative">
        {/* Compact Header */}
        <div className="relative border-b border-horror-red/20">
          <div className="container mx-auto max-w-4xl px-4 md:px-6 py-6 md:py-8">
            {/* Back button */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-horror-red transition-colors mb-6 group"
            >
              <svg className="w-3 h-3 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="uppercase tracking-wider font-bold">All Incidents</span>
            </Link>

            {/* Inline metadata bar */}
            <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
              <div className="flex items-center gap-1.5 text-gray-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-bold">{story.date}</span>
              </div>

              {story.severity && (
                <>
                  <div className="h-3 w-px bg-horror-red/30" />
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold uppercase tracking-wider",
                    config.color
                  )}>
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </span>
                </>
              )}

              {story.tags && story.tags.length > 0 && (
                <>
                  <div className="h-3 w-px bg-horror-red/30" />
                  <div className="flex flex-wrap gap-1.5">
                    {story.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-horror-orange/20 text-horror-orange border border-horror-orange/30 px-2 py-0.5 uppercase tracking-wider font-bold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Title - more compact */}
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl leading-tight text-gray-100 tracking-tight">
              {story.title}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto max-w-4xl px-4 md:px-6 py-8 md:py-12">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h2: ({ node, ...props }) => (
                  <h2 className="font-display text-2xl md:text-3xl mt-12 mb-4 text-horror-orange tracking-tight border-l-4 border-horror-orange pl-4" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="font-bold text-xl mt-8 mb-3 text-gray-100 tracking-tight" {...props} />
                ),
                h4: ({ node, ...props }) => (
                  <h4 className="font-bold text-xl mt-8 mb-3 text-gray-300" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="mb-4 leading-relaxed text-gray-300" {...props} />
                ),
                a: ({ node, href, ...props }) => {
                  // Just render Twitter links with special styling, no wrapper div
                  if (href?.includes('twitter.com') || href?.includes('x.com')) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-horror-red hover:text-horror-orange transition-colors underline decoration-horror-red/50 hover:decoration-horror-orange font-bold inline-flex items-center gap-1"
                        {...props}
                      >
                        {props.children}
                        <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </a>
                    )
                  }
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-horror-red hover:text-horror-orange transition-colors underline decoration-horror-red/50 hover:decoration-horror-orange font-medium"
                      {...props}
                    />
                  )
                },
                code: ({ node, className, children, ...props }) => {
                  const inline = !className
                  return inline ? (
                    <code className="bg-horror-gray/80 border border-horror-red/20 px-2 py-1 rounded text-sm font-mono text-horror-orange" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-horror-gray/80 border border-horror-red/20 p-6 overflow-x-auto font-mono text-sm text-gray-300 leading-relaxed" {...props}>
                      {children}
                    </code>
                  )
                },
                pre: ({ node, ...props }) => (
                  <pre className="bg-horror-gray/80 border-l-4 border-horror-red p-6 overflow-x-auto my-8 rounded-r" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-horror-orange bg-horror-orange/5 pl-8 py-6 my-8 italic text-gray-300" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="space-y-3 my-8 ml-6" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="space-y-3 my-8 ml-6" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-gray-300 leading-relaxed pl-2 relative before:content-['▸'] before:absolute before:left-[-1.5rem] before:text-horror-red" {...props} />
                ),
                hr: ({ node, ...props }) => (
                  <hr className="my-12 border-horror-red/30" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="text-gray-100 font-bold" {...props} />
                ),
              }}
            >
              {story.content}
            </ReactMarkdown>
          </div>

          {/* Related stories */}
          {related.length > 0 && (
            <aside aria-label="Related stories" className="mt-16 pt-8 border-t border-horror-red/20">
              <h2 className="font-display text-xl md:text-2xl text-horror-orange tracking-tight mb-6 uppercase">
                Related Incidents
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {related.map((rel) => (
                  <RelatedCard key={rel.slug} story={rel} />
                ))}
              </div>
            </aside>
          )}

          {/* Back to all stories link */}
          <div className="mt-12 pt-8 border-t border-horror-red/20 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-horror-red transition-colors group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="uppercase tracking-wider font-bold">Back to All Incidents</span>
            </Link>
          </div>
        </div>
      </article>
    </>
  )
}

function RelatedCard({ story }: { story: Story }) {
  const severityAccent = {
    critical: 'border-horror-red/40 hover:border-horror-red',
    high: 'border-horror-orange/40 hover:border-horror-orange',
    medium: 'border-yellow-400/40 hover:border-yellow-400',
  }[story.severity]

  return (
    <Link
      to="/story/$slug"
      params={{ slug: story.slug }}
      className={cn(
        'group flex flex-col bg-horror-gray/30 border p-5 transition-colors',
        severityAccent
      )}
    >
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 mb-3">
        <time>{story.date}</time>
        <span className="h-2.5 w-px bg-horror-red/30" />
        <span className="font-bold text-horror-red">{story.severity}</span>
      </div>
      <h3 className="font-display text-base md:text-lg text-gray-100 group-hover:text-horror-red transition-colors leading-snug tracking-tight mb-3 line-clamp-3">
        {story.title}
      </h3>
      <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 mb-4">{story.excerpt}</p>
      {story.tags && story.tags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1.5">
          {story.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-horror-orange/10 text-horror-orange/80 border border-horror-orange/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-bold"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
