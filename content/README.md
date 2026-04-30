# Content Directory Structure

This directory contains all AI horror stories in markdown format.

## Directory Layout

```
content/
├── drafts/          # Raw incident reports gathered by AI agents
│   └── *.md         # Unstructured content from various sources
│
└── blogs/           # Publication-ready stories (used by site)
    └── *.md         # Properly formatted stories with frontmatter
```

## Workflow

### For AI Agents (Automated)

1. **Gather**: Place raw incident reports in `content/drafts/`
   - Tweets, articles, incident reports, news
   - Any format, any structure

2. **Process**: Convert drafts to blog format
   - Follow [AI_AGENT_GUIDE.md](../AI_AGENT_GUIDE.md)
   - Extract key information
   - Structure with proper frontmatter
   - Add What/How/Why/Lessons/Prevention sections

3. **Publish**: Move to `content/blogs/`
   - Only publication-ready stories go here
   - Must follow template exactly
   - Will be included in site build

4. **Generate**: Build system reads from `content/blogs/`
   - Run `bun run generate` to create stories.json
   - Stories automatically appear on site

### For Human Contributors

1. **Create story** directly in `content/blogs/`
   - Follow [STORY_TEMPLATE.md](../STORY_TEMPLATE.md)
   - See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines
   - Reference [content/blogs/railway-cursor.md](blogs/railway-cursor.md) as example

2. **Submit PR** with your story
   - We'll review and merge
   - Site builds automatically

## File Requirements

### All blog posts MUST have:

```yaml
---
title: "Descriptive Title"
date: "YYYY-MM-DD"
severity: "critical|high|medium"
tags: ["tag1", "tag2"]
excerpt: "Brief summary (max 150 chars)"
---

## What Happened
## How It Happened  
## Why This Matters
## Lessons Learned
## Prevention Checklist

---
**Original Source:** [link]
```

### Drafts can be:

- Any format
- Any structure
- Raw tweets, articles, notes
- Will be processed by AI agents

## Commands

```bash
# Generate stories.json from content/blogs/
bun run generate

# Start dev server (auto-generates)
bun run dev

# Build for production (auto-generates)
bun run build
```

## References

- **Human template**: [STORY_TEMPLATE.md](../STORY_TEMPLATE.md)
- **AI agent guide**: [AI_AGENT_GUIDE.md](../AI_AGENT_GUIDE.md)
- **Contributing**: [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Example story**: [railway-cursor.md](blogs/railway-cursor.md)
