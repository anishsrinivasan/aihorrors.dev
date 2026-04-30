# Drafts Directory

This directory is for **raw, unstructured content** that AI agents collect from various sources.

## Purpose

AI agents monitoring Twitter, news sites, incident reports, and other sources place raw content here. Human contributors can also add rough drafts.

**This is NOT for publication-ready content.** Stories here need to be processed and structured before appearing on the site.

## What Goes Here

- Raw tweets and tweet threads
- Unformatted incident reports
- News article excerpts
- Reddit posts / HN discussions
- Rough notes and observations
- Links to sources with minimal context

## File Format

No strict format required. Can be:

```markdown
# Title or description

Raw content...
Links...
Notes...

---
Source: [url]
Date: YYYY-MM-DD
```

## Example

See [EXAMPLE_DRAFT.md](EXAMPLE_DRAFT.md) for a sample raw draft.

## Processing Workflow

1. **AI Agent places content here** (automated)
   - Monitors sources for AI disasters
   - Creates draft files with raw information
   - Includes source links and metadata

2. **AI Agent processes draft** (automated or manual trigger)
   - Reads [AI_AGENT_GUIDE.md](../AI_AGENT_GUIDE.md)
   - Extracts key information
   - Structures according to template
   - Adds proper frontmatter
   - Creates prevention checklist

3. **Outputs to blogs/** (ready for publication)
   - File moves to `content/blogs/`
   - Build system includes it automatically
   - Appears on website

4. **Cleanup** (optional)
   - Move processed drafts to `drafts/processed/`
   - Or delete if confident in conversion

## For Human Contributors

If you want to contribute but don't want to format everything perfectly:

1. Create a draft here with the key info
2. Someone (AI or human) will structure it properly
3. Much easier than filling out the full template

Just make sure to include:
- Source link
- Date of incident
- Brief description of what happened

## Commands

AI agents should NOT run these directly. The main build system handles generation:

```bash
# Generate site from content/blogs/ (not drafts)
bun run generate

# Drafts are excluded from build
```

## See Also

- [AI_AGENT_GUIDE.md](../../AI_AGENT_GUIDE.md) - Complete guide for converting drafts
- [STORY_TEMPLATE.md](../../STORY_TEMPLATE.md) - Target format for blogs
- [content/blogs/](../blogs/) - Publication-ready stories
