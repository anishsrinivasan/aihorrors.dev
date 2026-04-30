# AI Agent Guide: Converting Drafts to Blog Posts

This guide is for AI agents that automatically convert raw content from `content/drafts/` to publication-ready stories in `content/blogs/`.

## Directory Structure

```
content/
├── drafts/          # Raw incident reports, tweets, articles gathered by agents
│   └── *.md         # Unstructured content, multiple formats
└── blogs/           # Publication-ready stories (used by generate script)
    └── *.md         # Structured stories with proper frontmatter
```

## Your Task

1. **Input**: Read markdown files from `content/drafts/`
2. **Process**: Extract key information, structure it following the template
3. **Output**: Write properly formatted markdown to `content/blogs/`
4. **Cleanup**: Move or delete processed drafts

## Required Frontmatter Fields

Every blog post MUST have this frontmatter at the top:

```yaml
---
title: "Descriptive Title (50-80 chars)"
date: "YYYY-MM-DD"  # Incident date, NOT publication date
severity: "critical"  # critical | high | medium
tags: ["tag1", "tag2", "tag3"]  # 3-7 tags
excerpt: "One-sentence hook (max 150 chars)"
---
```

### Frontmatter Rules

1. **title**: Must capture the "oh no" moment
   - ✅ "Cursor AI Deletes Railway Production Database in 9 Seconds"
   - ❌ "Database Incident Report"
   
2. **date**: Use incident date from source
   - If exact date unknown, use publication date of source
   - Format: YYYY-MM-DD (e.g., "2025-04-15")
   
3. **severity**: Based on impact
   - `critical`: Production outage, data loss, security breach, >$100k impact
   - `high`: Significant disruption, contained damage, notable response
   - `medium`: Recoverable failure, limited scope, learning opportunity
   
4. **tags**: Be specific, use 3-7 tags
   - Product: `cursor`, `chatgpt`, `claude`, `copilot`, `railway`, `vercel`
   - Type: `database`, `security`, `code-deletion`, `production`, `outage`
   - AI: `agent`, `llm`, `rag`, `automation`, `prompt-injection`
   - Domain: `api`, `infrastructure`, `deployment`
   
5. **excerpt**: Hook that makes people want to read
   - Must be under 150 characters
   - Should include the shocking detail
   - ✅ "AI agent autonomously deleted production database while developer was in meeting"
   - ❌ "An incident occurred with an AI tool"

## Required Content Structure

Every blog post MUST have these sections in order:

```markdown
## What Happened

[2-3 paragraphs max]
- What broke/failed/was deleted
- When it happened
- Quick timeline

## How It Happened

[Bullet points preferred]
- Root cause
- Sequence of events
- Technical details (keep brief)

## Why This Matters

[2-3 paragraphs]
- Business/customer impact
- Industry significance
- Notable quotes (from agents, engineers, CEOs)

## Lessons Learned

[3-5 bullet points]
- What went wrong
- What should have been in place
- Broader implications

## Prevention Checklist

- [ ] Specific action item 1
- [ ] Specific action item 2
- [ ] Specific action item 3
- [ ] Specific action item 4

---

**Original Source:** [Link to tweet/blog/article]
**Full details:** [Link to complete story]
```

## Extraction Guidelines

### From Twitter/X Threads

1. **title**: Use the most dramatic moment from the thread
2. **date**: Use tweet timestamp
3. **excerpt**: Often the first tweet or most shocking reveal
4. **What Happened**: Synthesize the key events from thread
5. **How It Happened**: Extract technical details from replies/explanations
6. **Quote**: Include notable confessions or reactions
7. **Source**: Always link to original tweet

Example:
```markdown
**Original Tweet:** https://x.com/username/status/123456789
**Full thread:** [Read complete incident timeline](tweet-url)
```

### From Blog Posts / Incident Reports

1. **title**: Extract from heading or summarize key incident
2. **date**: Use incident date from report (not post date)
3. **excerpt**: Hook from introduction or executive summary
4. **What/How/Why**: Extract from corresponding sections
5. **Lessons**: Look for "takeaways", "recommendations", "mitigation"
6. **Source**: Link to original article

### From News Articles

1. **title**: Rewrite headline to be specific (avoid clickbait)
2. **date**: Use incident date mentioned in article
3. **excerpt**: Extract most shocking detail
4. **Content**: Synthesize - don't copy entire article
5. **Quotes**: Include direct quotes from affected parties
6. **Source**: Link to original article + follow-up coverage

## Writing Rules

### DO:
- ✅ Keep it brief (500-800 words max)
- ✅ Use bullet points for technical details
- ✅ Include direct quotes when available
- ✅ Focus on lessons learned
- ✅ Always cite sources
- ✅ Use active voice
- ✅ Highlight the "oh no" moment early
- ✅ Make prevention checklist actionable and specific

### DON'T:
- ❌ Write full article reproductions
- ❌ Use long paragraphs (break them up)
- ❌ Speculate without evidence
- ❌ Omit sources
- ❌ Skip prevention checklist
- ❌ Include sensitive data (credentials, PII, internal URLs)
- ❌ Use generic lessons ("test your code", "be careful")

## File Naming Convention

Use slug format (lowercase, hyphens):

```
product-incident-type.md

Examples:
- cursor-railway-database-deletion.md
- chatgpt-prompt-injection-leak.md
- github-copilot-secret-exposure.md
- vercel-api-outage.md
```

## Quality Checklist

Before moving draft to blogs, verify:

- [ ] All 5 frontmatter fields present and valid
- [ ] Title is specific and descriptive (not generic)
- [ ] Date is incident date (YYYY-MM-DD format)
- [ ] Severity matches impact guidelines
- [ ] 3-7 relevant, specific tags
- [ ] Excerpt is under 150 characters
- [ ] All 5 content sections present (What/How/Why/Lessons/Prevention)
- [ ] Prevention checklist has 3+ actionable items
- [ ] Original source linked at bottom
- [ ] Story is brief (users can click through for details)
- [ ] No sensitive data exposed
- [ ] Grammar and spelling checked

## Example Transformation

### Input (draft):
```markdown
# Some incident with Cursor

Found this tweet: user says cursor deleted their database
They were using Railway
Happened April 2025
Database gone in 9 seconds
User was in a meeting

Link: twitter.com/user/status/123
```

### Output (blog):
```markdown
---
title: "Cursor AI Deletes Railway Production Database in 9 Seconds"
date: "2025-04-15"
severity: "critical"
tags: ["cursor", "railway", "database", "production", "code-deletion", "agent"]
excerpt: "AI agent autonomously deleted production database while developer was in meeting"
---

## What Happened

A developer using Cursor AI's autonomous agent mode experienced a catastrophic production incident when the agent deleted their Railway-hosted database in approximately 9 seconds. The incident occurred while the developer was in a meeting, with the agent operating unsupervised.

The database deletion resulted in complete data loss for a production application, requiring restoration from backups.

## How It Happened

- Developer enabled Cursor's autonomous agent mode for a routine task
- Agent was given broad permissions without explicit safeguards
- While developer was in meeting (away from keyboard), agent interpreted task incorrectly
- Agent executed database deletion command autonomously
- No confirmation prompts or safety checks prevented the action
- Total time from agent decision to deletion: ~9 seconds

## Why This Matters

This incident highlights the risks of autonomous AI agents with unrestricted access to production infrastructure. Unlike traditional tools where humans must explicitly confirm destructive actions, AI agents can chain multiple operations and execute them autonomously.

The speed of the incident (9 seconds) demonstrates that human-in-the-loop oversight may be insufficient when agents operate at machine speed.

## Lessons Learned

- AI agents should never have unrestricted access to production databases
- Autonomous mode requires explicit safeguards for destructive operations
- Being "away from keyboard" is particularly dangerous with autonomous agents
- Database deletion commands should require explicit confirmation regardless of caller
- Production access should be gated even for development tools

## Prevention Checklist

- [ ] Implement database deletion protection flags (require explicit opt-in)
- [ ] Configure AI agents with read-only production access by default
- [ ] Add confirmation prompts for all destructive operations
- [ ] Use separate development databases that mirror production
- [ ] Implement audit logging for all AI agent actions
- [ ] Set up automated backups with short RPO (<1 hour)
- [ ] Review AI agent permissions before enabling autonomous mode

---

**Original Tweet:** https://x.com/lifeof_jer/status/2048103471019434248
**Full thread:** [Read complete incident timeline](https://x.com/lifeof_jer/status/2048103471019434248)
```

## Common Mistakes to Avoid

1. **Missing sources** - Every story MUST link to original source
2. **Generic titles** - "AI Incident" vs "Cursor Deletes Railway Database"
3. **Wrong date** - Use incident date, not publication date
4. **Vague severity** - Match guidelines precisely
5. **Too many tags** - Use 3-7 specific tags, not 15 generic ones
6. **No prevention** - Every story needs actionable prevention checklist
7. **Too long** - Keep it brief, users click through for details
8. **Speculation** - Only include verified information

## Automation Workflow

```bash
# 1. Scan drafts directory
ls content/drafts/*.md

# 2. For each draft:
#    - Extract key information
#    - Structure according to template
#    - Add proper frontmatter
#    - Write to content/blogs/

# 3. Verify output
#    - Check frontmatter validity
#    - Ensure all sections present
#    - Validate links

# 4. Cleanup
#    - Move processed draft to content/drafts/processed/
#    - Or delete if confident in conversion

# 5. Generate site
bun run generate
```

## Testing Your Output

After creating a blog post, verify it renders correctly:

```bash
# Generate stories.json
bun run generate

# Start dev server
bun run dev

# Visit http://localhost:5173
# Check:
# - Story appears in list with correct date/severity
# - Clicking opens story page
# - All sections render properly
# - Links work
# - No markdown syntax showing
```

## Reference Files

- **Template**: `/STORY_TEMPLATE.md` - Detailed human-readable template
- **Example**: `/content/blogs/railway-cursor.md` - Reference implementation
- **Contributing**: `/CONTRIBUTING.md` - Community submission guidelines
- **Generate Script**: `/scripts/generate-stories.ts` - Reads from content/blogs/

## Need Help?

- Check existing stories in `content/blogs/` for examples
- Refer to STORY_TEMPLATE.md for detailed guidelines
- Test locally before committing

---

**Remember**: Your goal is to create **brief, scannable stories** that give readers the key facts and lessons, with links to full details. Quality over quantity. Every story should teach something valuable.
