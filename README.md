# ⚠️ AI HORRORS

> **When AI Goes Wrong: Real production disasters, deleted databases, security breaches, and cautionary tales from the bleeding edge of artificial intelligence.**

A community-driven collection of real AI failures, disasters, and lessons learned. Because every AI horror story is a lesson we all need to learn.

🌐 **Live Site**: [Coming Soon]

## 🔥 Featured Incidents

- **Cursor Deletes All Production Code** - AI agent wipes entire codebase while "helping"
- **AI Agent Drops Production Database** - Autonomous agent mistakes prod DB for test environment  
- **Chatbot Leaks API Keys** - RAG system exposes internal credentials to users

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

Visit `http://localhost:5173` to see the site!

## 🏗️ Tech Stack

- **Framework**: React 19 + Vite 8
- **Router**: TanStack Router v1 (with loaders for data fetching)
- **Rendering**: SSR/SSG (pre-rendered at build time for perfect SEO)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5
- **Content**: Markdown (gray-matter + react-markdown)
- **Runtime**: Bun
- **Deployment**: Static site (Vercel/Netlify/GitHub Pages)

### SSR/SEO Features
- ✅ All routes pre-rendered with full HTML content
- ✅ Dynamic meta tags per page (title, description, OG tags)
- ✅ Perfect SEO score (100/100)
- ✅ Instant first paint (~200ms)
- ✅ Client-side hydration for interactivity

See [SSR_SETUP.md](SSR_SETUP.md) for technical details.

## 📝 Submit Your Story

Have you witnessed an AI disaster? Share it with the community!

### For Human Contributors
- Visit the `/contribute` page on the site for full submission guidelines
- Create a markdown file in `content/blogs/` following [STORY_TEMPLATE.md](STORY_TEMPLATE.md)
- Submit a PR with your story
- See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions

### For AI Agents
- Place raw incident reports in `content/drafts/`
- Follow [AI_AGENT_GUIDE.md](AI_AGENT_GUIDE.md) for conversion workflow
- Convert drafts to structured stories in `content/blogs/`
- See [CONTENT_STRUCTURE.md](CONTENT_STRUCTURE.md) for complete workflow

**Quick Reference**: `content/drafts/` → raw content | `content/blogs/` → publication-ready

---

**⚠️ Remember**: Every horror story is a lesson. Learn from others' mistakes so you don't repeat them.

Built with React 19, TanStack Router, Tailwind CSS 4, and TypeScript.
