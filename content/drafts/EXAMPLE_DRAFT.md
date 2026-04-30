# Example Draft - ChatGPT API Key Leak

This is an example of raw content that an AI agent would process.

## Source Information
- Tweet: https://x.com/example_user/status/123456789
- Date: May 1, 2026
- Impact: High

## Raw Notes

Developer accidentally committed OpenAI API key to public GitHub repo.
GitHub scanner detected it in 2 minutes.
Key was used for $5000 in unauthorized API calls before being revoked.
Happened overnight, developer woke up to billing alert.

The key had no rate limits or spend caps configured.
Used for crypto mining prompt operations.

Developer quote: "I thought .env files were automatically ignored"
They had .env in .gitignore but committed .env.local

## What I Found

- Company: Indie SaaS developer
- Product: AI writing assistant
- Timeline:
  - 11:30 PM: Committed .env.local
  - 11:32 PM: GitHub security scan detected key
  - 11:35 PM: First unauthorized use
  - 7:45 AM: Developer woke up to $5000 bill
  - 8:00 AM: Key revoked

## Technical Details

File committed: `.env.local`
Contains: OPENAI_API_KEY=sk-proj-...

Bot scraped within 5 minutes of commit.
Made 50,000+ requests for crypto-related content generation.
No spend limits on OpenAI account.

## Lessons

- .env.local not in .gitignore by default
- GitHub scans work but don't auto-revoke
- API keys need spend caps
- Pre-commit hooks would have caught this
- OpenAI doesn't alert for unusual usage patterns

---

**TODO**: Convert this to proper blog format following STORY_TEMPLATE.md
**Severity**: High (not critical - no data loss, but significant financial)
**Tags**: security, api-key, github, chatgpt, leak
