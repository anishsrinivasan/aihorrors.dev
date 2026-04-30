# Content Structure & AI Agent Workflow

## Directory Changes

**Old structure:**
```
stories/
└── *.md
```

**New structure:**
```
content/
├── drafts/          # Raw content from AI agents
│   ├── README.md
│   └── *.md
└── blogs/           # Publication-ready stories
    ├── README.md
    └── *.md
```

## Build Process

```bash
# 1. Generate stories.json from content/blogs/
scripts/generate-stories.ts

# 2. Build site
vite build

# Stories are read from: content/blogs/
# Output goes to: src/data/stories.json
```

## Files Updated

### Build System
- ✅ `scripts/generate-stories.ts` - Now reads from `content/blogs/` instead of `stories/`
- ✅ `package.json` - Scripts unchanged (still run `bun run generate`)

### Documentation
- ✅ `CONTRIBUTING.md` - Updated paths to `content/blogs/`, added AI agent reference
- ✅ `STORY_TEMPLATE.md` - Updated example paths, added AI agent guide link
- ✅ `AI_AGENT_GUIDE.md` - **NEW** - Complete guide for AI agents converting drafts to blogs
- ✅ `CONTENT_STRUCTURE.md` - **NEW** - This file
- ✅ `content/README.md` - **NEW** - Overview of content directory structure
- ✅ `content/drafts/README.md` - **NEW** - Drafts directory explanation
- ✅ `content/drafts/EXAMPLE_DRAFT.md` - **NEW** - Sample raw draft

### Content
- ✅ Moved `stories/railway-cursor.md` → `content/blogs/railway-cursor.md`

## AI Agent Workflow

### 1. Gathering Phase (Automated)
```
AI Agent monitors sources → Creates raw draft → content/drafts/
```

Example sources:
- Twitter/X for incident tweets
- Reddit r/programming, r/MachineLearning
- Hacker News
- Tech news sites
- GitHub incident reports
- Company status pages

### 2. Processing Phase (Automated or Manual)
```
AI Agent reads content/drafts/ → Follows AI_AGENT_GUIDE.md → Outputs to content/blogs/
```

Key steps:
1. Extract incident information
2. Structure with proper frontmatter
3. Create What/How/Why/Lessons/Prevention sections
4. Add source links
5. Verify quality checklist
6. Write to `content/blogs/`

### 3. Publication Phase (Automatic)
```
Build system runs → Generates stories.json → Site updates
```

## For Human Contributors

### Option 1: Direct Blog Submission
1. Create file in `content/blogs/`
2. Follow [STORY_TEMPLATE.md](STORY_TEMPLATE.md)
3. Submit PR

### Option 2: Draft Submission
1. Create rough draft in `content/drafts/`
2. Include source links and key info
3. AI agent will process it
4. Review and submit

## Documentation for Each Audience

| Audience | Document | Purpose |
|----------|----------|---------|
| Human contributors | [STORY_TEMPLATE.md](STORY_TEMPLATE.md) | How to write a story |
| Human contributors | [CONTRIBUTING.md](CONTRIBUTING.md) | How to submit |
| AI agents | [AI_AGENT_GUIDE.md](AI_AGENT_GUIDE.md) | How to convert drafts |
| Everyone | [content/README.md](content/README.md) | Directory overview |
| Draft creators | [content/drafts/README.md](content/drafts/README.md) | How to use drafts |

## Commands Reference

```bash
# Generate stories.json from content/blogs/
bun run generate

# Start dev server (auto-generates)
bun run dev

# Build for production (auto-generates)
bun run build

# Preview production build
bun run preview
```

## File Naming Convention

**Blogs (production-ready):**
```
content/blogs/product-incident-type.md

Examples:
- cursor-railway-database-deletion.md
- chatgpt-prompt-injection-leak.md
- github-copilot-secret-exposure.md
```

**Drafts (raw content):**
```
content/drafts/anything.md

No strict naming required
```

## Quality Gates

### Drafts (no requirements)
- Can be any format
- No frontmatter needed
- Just needs source link

### Blogs (strict requirements)
- ✅ Valid frontmatter (title, date, severity, tags, excerpt)
- ✅ All 5 sections (What/How/Why/Lessons/Prevention)
- ✅ Source links at bottom
- ✅ Prevention checklist (3+ items)
- ✅ Under 150 char excerpt
- ✅ 3-7 specific tags

## Testing

```bash
# 1. Add story to content/blogs/
touch content/blogs/test-story.md

# 2. Run generate
bun run generate

# 3. Check stories.json
cat src/data/stories.json

# 4. Start dev server
bun run dev

# 5. Visit http://localhost:5173
# Verify story appears in list and opens correctly
```

## Migration Notes

If you have stories in old `stories/` directory:

```bash
# Move to new location
mv stories/*.md content/blogs/

# Remove old directory
rm -rf stories/
```

Build system now only reads from `content/blogs/`.

## Future Enhancements

Potential additions to AI agent workflow:

1. **Auto-categorization** - Classify by severity/tags
2. **Duplicate detection** - Check if incident already covered
3. **Source verification** - Validate links still work
4. **Quality scoring** - Rate completeness of drafts
5. **Scheduled processing** - Batch convert drafts nightly
6. **PR automation** - Auto-create PRs for reviewed stories

## Questions?

- **Where do published stories go?** → `content/blogs/`
- **Where do AI agents put raw content?** → `content/drafts/`
- **What does the build system read?** → `content/blogs/` only
- **How do I test locally?** → `bun run dev`
- **Where's the template?** → `STORY_TEMPLATE.md`
- **Where's the AI guide?** → `AI_AGENT_GUIDE.md`

---

**Summary**: Stories moved from `stories/` to `content/blogs/`. New `content/drafts/` directory for AI agents to gather raw content. Complete AI agent workflow documentation in `AI_AGENT_GUIDE.md`.
