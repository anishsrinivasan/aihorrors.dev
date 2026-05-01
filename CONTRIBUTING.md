# Contributing to AI Horrors

Thank you for your interest in contributing! This project exists to document real AI failures and help the community learn from them.

## Types of Contributions

### 1. Submit AI Horror Stories

The main way to contribute is by sharing real AI disaster stories.

**Requirements:**
- Story must be about a real incident (no fiction)
- Include lessons learned and resolution
- Remove sensitive data (credentials, PII, etc.)
- Anonymize company names if needed

**How to Submit:**

1. Fork this repository
2. Create a new markdown file in `content/blogs/` directory
3. **Follow the story template in [STORY_TEMPLATE.md](STORY_TEMPLATE.md)**
4. Submit a Pull Request

**Note**: Raw drafts can be placed in `content/drafts/` - they will be processed by AI agents and moved to `content/blogs/` when ready.

**⚠️ IMPORTANT:** Stories should be **brief and scannable**. Users can follow links for full details.

See [STORY_TEMPLATE.md](STORY_TEMPLATE.md) for complete guidelines and [content/blogs/cursor-deletes-production-database.md](content/blogs/cursor-deletes-production-database.md) for a real example.

For AI agents: See [AI_AGENT_GUIDE.md](AI_AGENT_GUIDE.md) for automated draft-to-blog conversion.

**Quick Template:**

```markdown
---
title: "What Happened (Brief Title)"
date: "YYYY-MM-DD"
severity: "critical"  # critical | high | medium
tags: ["tag1", "tag2", "tag3"]
excerpt: "One sentence summary (max 150 chars)"
---

## What Happened

Brief overview (2-3 paragraphs max)

## How It Happened

Technical details (bullet points preferred)

## Why This Matters

Impact and significance

## Lessons Learned

Key takeaways (3-5 bullets)

## Prevention Checklist

- [ ] Action item 1
- [ ] Action item 2

---

**Original Tweet/Source:** [Link]
**Full details:** [Link to complete story]

Key takeaways and prevention strategies...

## Prevention Checklist

- [ ] Specific action item 1
- [ ] Specific action item 2
- [ ] Specific action item 3
```

**Frontmatter Fields:**
- `title`: Clear, descriptive title
- `date`: When the incident occurred (YYYY-MM-DD format)
- `severity`: `critical`, `high`, or `medium`
- `tags`: Array of relevant tags (e.g., `["database", "production", "security"]`)
- `excerpt`: Brief summary for the card view (max 150 characters)

**Severity Guidelines:**
- **critical** 🔴: Production outage, data loss, security breach, major financial impact
- **high** 🟠: Significant disruption, contained damage, notable incident
- **medium** 🟡: Recoverable failure, limited impact, learning opportunity

**Recommended Tags:**
`database`, `production`, `security`, `api`, `llm`, `agent`, `chatbot`, `rag`, `automation`, `deployment`, `infrastructure`, `code-deletion`, `data-leak`, `prompt-injection`, `hallucination`, `model-failure`

### 2. Improve the Website

Contributions to improve the site are welcome:

- UI/UX improvements
- Performance optimizations
- Accessibility enhancements
- Bug fixes
- Feature additions

**Tech Stack:**
- React 19 + TypeScript
- TanStack Router v1
- Tailwind CSS 4
- Vite 8
- Bun runtime

**Development:**

```bash
bun install
bun run dev
```

### 3. Documentation

Help improve documentation:
- README updates
- Code comments
- Contribution guidelines
- Deployment guides

## Pull Request Process

1. **Fork** the repository
2. **Create a branch** from `main`
   ```bash
   git checkout -b add-story/your-story-name
   # or
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test locally** (`bun run dev`)
5. **Commit with clear message**
   ```bash
   git commit -m "Add story: AI deletes production database"
   # or
   git commit -m "Fix: mobile responsive layout on story cards"
   ```
6. **Push to your fork**
   ```bash
   git push origin add-story/your-story-name
   ```
7. **Open a Pull Request** against `main`

## Story Review Criteria

Stories are reviewed for:

✅ **Authenticity**: Real incident, not hypothetical  
✅ **Completeness**: Includes what happened, impact, resolution, and lessons  
✅ **Formatting**: Proper frontmatter and markdown structure  
✅ **No Sensitive Data**: Credentials, PII removed  
✅ **Lessons Learned**: Actionable takeaways included  
✅ **Appropriate Tags**: Relevant, accurate tags  
✅ **Sources**: Links to public incident reports, tweets, blog posts (if available)

## Code of Conduct

- Be respectful and constructive
- Focus on learning, not blaming
- Anonymize when necessary
- Don't share active vulnerabilities
- Credit sources appropriately

## Questions?

- Open an issue for questions
- Tag maintainers for urgent matters
- Check existing stories for examples

---

**Thank you for helping make AI systems safer through shared learning!**
