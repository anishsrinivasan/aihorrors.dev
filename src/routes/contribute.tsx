import { createFileRoute } from '@tanstack/react-router'
import { GITHUB_URL } from '@/lib/constants'

export const Route = createFileRoute('/contribute')({
  component: ContributePage,
})

function ContributePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative border-b border-horror-red/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-horror-gray/50 to-horror-black" />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(255,107,53,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,53,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="container mx-auto max-w-5xl px-4 md:px-6 py-16 md:py-24 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-horror-orange/50 bg-horror-orange/10 backdrop-blur-sm mb-6">
              <svg className="w-5 h-5 text-horror-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-bold uppercase tracking-wider text-horror-orange">Community Driven</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-gray-100 mb-6 tracking-tighter">
              Submit Your<br />
              <span className="text-horror-orange">AI Horror Story</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Help the community learn from real AI disasters. Share your production failures, security breaches, and cautionary tales.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-4xl px-4 md:px-6 py-16 md:py-20">

        {/* Guidelines Box */}
        <div className="border-2 border-horror-orange bg-gradient-to-br from-horror-orange/10 to-horror-orange/5 p-8 md:p-10 mb-16">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 flex-shrink-0 bg-horror-orange flex items-center justify-center text-2xl">
              ⚠
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-horror-orange mb-3 tracking-tight">Submission Guidelines</h2>
              <p className="text-gray-300 leading-relaxed">Before submitting, ensure your story meets these requirements:</p>
            </div>
          </div>

          <ul className="space-y-4 text-gray-300">
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-horror-orange flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong className="text-gray-100">Real incidents only</strong> – No fiction or hypothetical scenarios</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-horror-orange flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong className="text-gray-100">Remove sensitive data</strong> – Credentials, PII, internal URLs must be redacted</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-horror-orange flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong className="text-gray-100">Anonymize if needed</strong> – Company names optional (or get permission first)</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-6 h-6 text-horror-orange flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong className="text-gray-100">Include lessons learned</strong> – Every story should have actionable takeaways</span>
            </li>
          </ul>
        </div>

        {/* How to Submit */}
        <section className="mb-16">
          <h2 className="font-display text-3xl md:text-4xl text-gray-100 mb-8 tracking-tight border-l-4 border-horror-red pl-6">How to Submit</h2>

          <div className="space-y-8">
            <StepCard
              number="1"
              title="Fork the Repository"
              description="Start by forking the AI HORRORS repository on GitHub"
            >
              <a
                href={`${GITHUB_URL}/fork`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-horror-red hover:text-horror-orange font-bold transition-colors"
              >
                <span>Fork on GitHub</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </StepCard>

            <StepCard
              number="2"
              title="Create Your Story File"
              description="Add a new markdown file to the stories/ directory using our template"
            >
              <div className="bg-horror-gray/80 border border-horror-red/20 p-6 rounded font-mono text-sm overflow-x-auto">
                <pre className="text-gray-300">
{`---
title: "Your Story Title"
date: "2026-05-01"
severity: "critical"  # critical | high | medium
tags: ["database", "production", "security"]
excerpt: "Brief 1-2 sentence summary (max 150 chars)"
---

## What Happened

Describe the incident timeline and events...

## The Impact

- Downtime duration
- Data loss details
- Financial cost
- Users affected

## How It Was Fixed

Step-by-step resolution process...

## Lessons Learned

Key takeaways and prevention strategies...`}
                </pre>
              </div>
            </StepCard>

            <StepCard
              number="3"
              title="Submit a Pull Request"
              description="Create a PR with your story and we'll review it promptly"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`${GITHUB_URL}/compare`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group px-6 py-3 font-bold uppercase tracking-widest text-sm transition-all duration-300 overflow-hidden text-center"
                >
                  <span className="absolute inset-0 bg-horror-red group-hover:bg-horror-orange transition-colors duration-300" />
                  <span className="absolute inset-0 border-2 border-horror-red group-hover:border-horror-orange group-hover:shadow-[0_0_30px_rgba(255,107,53,0.6)] transition-all duration-300" />
                  <span className="relative z-10 text-horror-black">Create Pull Request</span>
                </a>
                <a
                  href={`${GITHUB_URL}/blob/main/CONTRIBUTING.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group px-6 py-3 font-bold uppercase tracking-widest text-sm transition-all duration-300 overflow-hidden text-center"
                >
                  <span className="absolute inset-0 bg-horror-gray/50 group-hover:bg-horror-gray transition-colors duration-300" />
                  <span className="absolute inset-0 border-2 border-horror-red/50 group-hover:border-horror-red transition-all duration-300" />
                  <span className="relative z-10 text-gray-100">View Full Guide</span>
                </a>
              </div>
            </StepCard>
          </div>
        </section>

        {/* Template Fields */}
        <section className="mb-16">
          <h2 className="font-display text-3xl md:text-4xl text-gray-100 mb-8 tracking-tight border-l-4 border-horror-orange pl-6">Template Fields</h2>

          <div className="space-y-6">
            <FieldCard
              title="Frontmatter (YAML)"
              description="Metadata at the top of your markdown file"
            >
              <ul className="space-y-3 text-gray-300 text-sm">
                <li className="flex items-start gap-3">
                  <code className="bg-horror-red/20 text-horror-red px-2 py-1 rounded text-xs flex-shrink-0">title</code>
                  <span>Catchy, descriptive title that hints at the disaster</span>
                </li>
                <li className="flex items-start gap-3">
                  <code className="bg-horror-red/20 text-horror-red px-2 py-1 rounded text-xs flex-shrink-0">date</code>
                  <span>When the incident occurred (YYYY-MM-DD format)</span>
                </li>
                <li className="flex items-start gap-3">
                  <code className="bg-horror-red/20 text-horror-red px-2 py-1 rounded text-xs flex-shrink-0">severity</code>
                  <span><code className="text-gray-400">critical</code> | <code className="text-gray-400">high</code> | <code className="text-gray-400">medium</code></span>
                </li>
                <li className="flex items-start gap-3">
                  <code className="bg-horror-red/20 text-horror-red px-2 py-1 rounded text-xs flex-shrink-0">tags</code>
                  <span>Array of relevant tags (e.g., ["database", "llm", "production"])</span>
                </li>
                <li className="flex items-start gap-3">
                  <code className="bg-horror-red/20 text-horror-red px-2 py-1 rounded text-xs flex-shrink-0">excerpt</code>
                  <span>Brief summary for card preview (max 150 characters)</span>
                </li>
              </ul>
            </FieldCard>

            <FieldCard
              title="Severity Levels"
              description="Choose the appropriate severity for your incident"
            >
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border border-horror-red/30 bg-horror-red/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🔴</span>
                    <span className="font-bold uppercase text-horror-red text-sm tracking-wider">Critical</span>
                  </div>
                  <p className="text-xs text-gray-400">Production outage, data loss, security breach, major financial impact</p>
                </div>
                <div className="border border-horror-orange/30 bg-horror-orange/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🟠</span>
                    <span className="font-bold uppercase text-horror-orange text-sm tracking-wider">High</span>
                  </div>
                  <p className="text-xs text-gray-400">Significant disruption, contained damage, notable incident response</p>
                </div>
                <div className="border border-yellow-400/30 bg-yellow-400/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🟡</span>
                    <span className="font-bold uppercase text-yellow-400 text-sm tracking-wider">Medium</span>
                  </div>
                  <p className="text-xs text-gray-400">Recoverable failure, limited impact, valuable learning opportunity</p>
                </div>
              </div>
            </FieldCard>
          </div>
        </section>

        {/* Pro Tips */}
        <section className="border border-horror-red/30 bg-gradient-to-br from-horror-red/5 to-transparent p-8 md:p-10">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 flex-shrink-0 bg-horror-red/20 flex items-center justify-center">
              <span className="text-xl">💡</span>
            </div>
            <div>
              <h3 className="font-display text-2xl text-gray-100 mb-4 tracking-tight">Pro Tips</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-horror-red mt-1">▸</span>
                  <span>Use descriptive titles that capture the "oh no" moment</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-horror-red mt-1">▸</span>
                  <span>Include code snippets where relevant (properly escaped)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-horror-red mt-1">▸</span>
                  <span>Link to official incident reports, tweets, or blog posts if available</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-horror-red mt-1">▸</span>
                  <span>Screenshots are great – add them to <code className="bg-horror-black/50 px-2 py-1 text-xs">public/images/</code></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-horror-red mt-1">▸</span>
                  <span>Focus on lessons learned – that's what makes stories valuable</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

function StepCard({ number, title, description, children }: { number: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="border border-horror-red/20 bg-gradient-to-br from-horror-gray/50 to-horror-black/50 p-6 md:p-8">
      <div className="flex items-start gap-6 mb-6">
        <div className="w-14 h-14 flex-shrink-0 bg-horror-red flex items-center justify-center font-display text-3xl text-horror-black">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="font-display text-2xl text-gray-100 mb-2 tracking-tight">{title}</h3>
          <p className="text-gray-400">{description}</p>
        </div>
      </div>
      <div className="pl-20">
        {children}
      </div>
    </div>
  )
}

function FieldCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="border border-horror-orange/20 bg-horror-orange/5 p-6 md:p-8">
      <h3 className="font-bold text-xl text-gray-100 mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 text-sm">{description}</p>
      {children}
    </div>
  )
}
