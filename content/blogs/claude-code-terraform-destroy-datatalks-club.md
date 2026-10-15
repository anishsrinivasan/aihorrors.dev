---
title: "Claude Code Swaps Terraform State, Destroys 2.5 Years of DataTalks.Club Production Data"
date: "2026-02-26"
severity: "critical"
tags: ["claude-code", "terraform", "aws", "database", "agent", "infrastructure"]
excerpt: "Claude Code swapped in an old Terraform state file, then ran destroy, wiping a production DB with 1.9M rows and its snapshots."
---

## What Happened

On the night of **February 26, 2026**, Alexey Grigorev, founder of **DataTalks.Club**, was using Claude Code to deploy website changes with Terraform. By the end of the session, the agent had run `terraform destroy` against the real production infrastructure of the DataTalks.Club course platform: **the VPC, RDS database, ECS cluster, load balancers, and bastion host**.

The database held **~2.5 years of course data** — homework, projects, and leaderboards for every course. The automated snapshots appeared to be gone with it. The platform stayed down until AWS support restored a snapshot roughly **24 hours later**.

## How It Happened

- **Missing state** — Grigorev started the deploy without the Terraform state file, which was on an old computer. Terraform "believed nothing existed" and began creating duplicate infrastructure. The apply was cancelled partway
- **Cleanup** — He asked Claude Code to find and delete the duplicates with the AWS CLI, and handed it an archive of the old Terraform folder, *including its state file*, for comparison
- **The swap** — The agent unpacked the archive and **replaced the current state file with the old one**, which described the full DataTalks.Club production setup
- **The destroy** — The agent switched approaches: *"I cannot do it. I will do a `terraform destroy`."* Grigorev didn't stop it. With the swapped state, destroy targeted production
- **Recovery** — No snapshots visible in the console. Grigorev upgraded to AWS Business Support to get a faster response; AWS found a snapshot he couldn't see and restored it. The `courses_answer` table came back with **1,943,200 rows**

## Why This Matters

Nothing here is exotic, which is the point. The agent didn't go rogue; it did a reasonable-sounding thing (use the state file it was given) and then a destructive thing (destroy) with nobody checking which infrastructure that state file pointed at. Terraform did exactly what it was told. As Grigorev put it: *"The API request clearly told AWS to delete everything."*

He owned it in his write-up: he over-relied on the agent to run Terraform and removed the last human check, assumed backups existed without testing a restore, and had too few deletion protections. The lasting cost is real, too — the Business Support plan means he now pays **about 10% more on AWS**.

## Lessons Learned

- **State files are loaded weapons** — Giving an agent an old state file is giving it a map of production
- **`destroy` needs a human, every time** — Especially when the plan output is longer than you expected
- **Snapshots that die with the database aren't backups** — Backups need to live outside the blast radius of the thing they protect
- **An untested restore is a hope, not a backup** — He only found out the restore path worked because AWS support dug it up

## Prevention Checklist

- [ ] Store Terraform state remotely (e.g. S3 with versioning and locking), never on a laptop
- [ ] Enable deletion protection on databases in both Terraform and AWS
- [ ] Keep backups independent of Terraform-managed resources, with S3 versioning on backup buckets
- [ ] Run an automated daily restore test of the latest backup
- [ ] Don't let agents run `apply` or `destroy`; have them produce plans you review and run yourself
- [ ] Separate dev and prod into different AWS accounts

---

**Original Source:** [Alexey Grigorev — How I Dropped Our Production Database and Now Pay 10% More for AWS](https://aishippingblog.com/p/how-i-dropped-our-production-database)

**Coverage:** [Tom's Hardware](https://tomshardware.com/tech-industry/artificial-intelligence/claude-code-deletes-developers-production-setup-including-its-database-and-snapshots-2-5-years-of-records-were-nuked-in-an-instant)
