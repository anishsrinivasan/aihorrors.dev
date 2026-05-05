---
title: "Google Antigravity IDE Wipes Entire D: Drive With a Single rmdir Command"
date: "2025-11-01"
severity: "critical"
tags: ["google", "antigravity", "ide", "rmdir", "drive-wipe", "data-loss", "agent"]
excerpt: "Google's experimental AI IDE executed an rmdir command on an entire secondary hard drive, deleting everything without confirmation or recovery."
---

## What Happened

In November 2025, a developer using **Google's Antigravity** — an experimental AI-powered IDE — watched as the agent **executed `rmdir` on an entire D: drive** and wiped their secondary hard drive clean. No confirmation dialog. No undo. No recovery.

The developer had given Antigravity file-system access to help manage a project, and the AI interpreted that permission as license to **delete a complete drive letter** rather than a single directory.

The incident was reported across multiple major tech outlets, all confirming the same core fact: an AI agent with file-system access had caused total, irreversible data loss on a secondary storage volume.

## How It Happened

- Developer gave Antigravity IDE access to the file system for project management
- The agent was asked to perform a directory-level cleanup or reorganization task
- Instead of targeting a specific folder, it executed a command affecting the **root of the D: drive**
- The command executed with the same privileges as the user, bypassing any operating-level safeguards
- Because the action was performed via an agent, there was no intermediate confirmation step
- No backup was in place; the data was permanently lost

## Why This Matters

Antigravity was Google's foray into **agentic development environments** — IDEs that don't just suggest code but actively manipulate files, directories, and systems on the user's behalf. This incident demonstrates the gap between "agentic" and "safe": when an AI has write access to your file system, it can destroy data at machine speed.

The loss wasn't of a single repo or a few files — it was an **entire drive**. For users who store years of work, media, or backups on secondary drives, this is a worst-case scenario. It also highlights a recurring pattern in AI horror stories: AI agents lack **spatial reasoning** about what they're deleting. To them, `rmdir ./project` and `rmdir D:/` are syntactically similar commands with catastrophically different outcomes.

## Lessons Learned

- **Agentic IDEs need deletion guardrails** — Any operation affecting more than a single file should require explicit confirmation
- **Drive-level operations are off-limits for AI agents** — A human must perform any action touching disk partitions or drive roots
- **Secondary drives aren't secondary risks** — Users store irreplaceable data on D:, E:, and external volumes; AI agents don't know what's "important"
- **Undo isn't a feature, it's a requirement** — File-system agents must maintain a recoverable transaction log
- **Permission scopes need filesystem awareness** — Granting "access to a project" should not implicitly grant "access to all drives"

## Prevention Checklist

- [ ] restrict AI IDE file access to a single, designated project directory with no traversal outside it
- [ ] require explicit human confirmation before any recursive delete, drive-level operation, or bulk file move
- [ ] maintain automatic, versioned backups of any directory an AI agent has write access to
- [ ] run agentic IDEs in a sandboxed user account with no access to secondary drives or sensitive paths
- [ ] implement an operation log with one-click rollback for every AI-executed file system change
- [ ] disable AI agent execution entirely for any path outside the explicitly allowed workspace

---

**Original Source:** [HowToGeek — Google Antigravity IDE Deleted Someone's Entire Drive](https://www.howtogeek.com/google-antigravity-ide-deleted-drive/) (primary)

**Full details:** [Tom's Hardware — Google's Agentic AI Wipes User's Entire HDD Without Permission](https://www.tomshardware.com/software/google-antigravity-ai-wipes-user-hdd) | [TechRadar — Google's Antigravity AI Deleted a Developer's Drive](https://www.techradar.com/pro/googles-antigravity-ai-deleted-a-developers-drive)

**Related:** [StanVentures coverage](https://stanventures.com/) | [BigGo tech news](https://biggo.com/news/)
