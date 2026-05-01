# AI Horrors Story Template

Use this template when creating new incident stories. Keep stories **brief and scannable** — users can follow links for full details.

## File Format

```markdown
---
title: "Descriptive Title (What Happened)"
date: "YYYY-MM-DD"
severity: "critical"  # critical | high | medium
tags: ["tag1", "tag2", "tag3"]
excerpt: "One-sentence summary (max 150 chars)"
---

## What Happened

**Brief overview (2-3 paragraphs max):**
- What broke/failed/was deleted
- When it happened
- Quick timeline if relevant

Keep it factual and concise.

## How It Happened

**Technical details (bullet points preferred):**
- Root cause
- Sequence of events
- Multiple failure points if applicable

Use code blocks for commands/code if relevant (but keep them short).

## Why This Matters

**Impact and lessons:**
- Business/customer impact
- Why this is significant
- What makes this incident notable

If there are quotes (from agents, CEOs, reports), include them here.

## Lessons Learned

**Key takeaways (3-5 bullet points):**
- What went wrong
- What should have been in place
- Broader industry implications

## Prevention Checklist

**Actionable items:**
- [ ] Specific action item 1
- [ ] Specific action item 2
- [ ] Specific action item 3

---

**Original Tweet:** [Link to tweet if applicable]
OR
**Original Source:** [Link to blog post, incident report, etc.]

**Full details:** Link to complete thread/article/report for readers who want more

**Related:** Any related coverage, follow-up articles, vendor responses
```

## Severity Guidelines

- **critical** 🔴: Production outage, data loss, security breach, major financial impact
- **high** 🟠: Significant disruption, contained damage, notable incident
- **medium** 🟡: Recoverable failure, limited impact, learning opportunity

## Tag Guidelines

Common tags:
- **Product/Tool**: `cursor`, `chatgpt`, `copilot`, `claude`, `railway`, `vercel`, etc.
- **Incident Type**: `database`, `security`, `data-leak`, `code-deletion`, `production`, `outage`
- **AI Type**: `agent`, `chatbot`, `llm`, `rag`, `automation`
- **Domain**: `api`, `infrastructure`, `deployment`, `backup-failure`

Use 3-7 tags. Be specific.

## Writing Style

### DO:
- ✅ Keep it brief (users can click through for details)
- ✅ Use bullet points for scanability
- ✅ Include direct quotes (especially from AI agents/confessions)
- ✅ Highlight the "oh no" moment
- ✅ Focus on lessons learned
- ✅ Link to original sources
- ✅ Use active voice
- ✅ Be specific about numbers/timeline

### DON'T:
- ❌ Write long paragraphs (break them up)
- ❌ Repeat full technical explanations (link to source)
- ❌ Include entire blog posts/articles
- ❌ Speculate without evidence
- ❌ Omit sources
- ❌ Use passive voice
- ❌ Skip the prevention checklist

## Twitter/X Embed Guidelines

When the source is a tweet:
1. Always include the tweet URL at the bottom:
   ```markdown
   **Original Tweet:** https://x.com/username/status/123456789
   ```

2. Include a call-to-action to read the full thread:
   ```markdown
   **Full thread:** [Read complete incident timeline](tweet-url)
   ```

3. If there's a notable quote from the tweet, include it in the story
4. The tweet will automatically display with Twitter icon in the rendered page

## Example: Cursor/Railway Incident

See `content/blogs/cursor-deletes-production-database.md` for a complete example following this format.

**Key features of that story:**
- Concise "What/How/Why" structure
- Agent's confession quoted directly
- Technical details in bullets
- Clear prevention checklist
- Links to original tweet and full details
- Focused on lessons, not full incident reproduction

## Common Mistakes to Avoid

1. **Too much detail** - Users want the summary. They'll click through for full story.
2. **Missing sources** - Always link to original tweet/blog/report
3. **No actionable takeaways** - Every story should have prevention checklist
4. **Burying the lede** - Put the shocking/important part up front
5. **No context** - Explain why this matters to the broader community

## Quick Start

```bash
# 1. Create new story in blogs directory
touch content/blogs/your-story-slug.md

# 2. Fill in frontmatter
# 3. Write What/How/Why sections
# 4. Add prevention checklist
# 5. Link to original source
# 6. Build will auto-generate from markdown

bun run dev  # Server will regenerate stories.json
```

**For AI agents**: See [AI_AGENT_GUIDE.md](AI_AGENT_GUIDE.md) for automated conversion from drafts.

## Review Checklist

Before submitting a story:
- [ ] Frontmatter complete with all required fields
- [ ] Title is descriptive (not clickbait)
- [ ] Date is when incident occurred (not when posted)
- [ ] Severity matches guidelines
- [ ] Tags are specific and relevant (3-7 tags)
- [ ] Excerpt is under 150 characters
- [ ] Story structure: What → How → Why → Lessons → Prevention
- [ ] Original source linked at bottom
- [ ] Prevention checklist included
- [ ] Story is brief (users can read full source)
- [ ] No sensitive data exposed
- [ ] Grammar/spelling checked
