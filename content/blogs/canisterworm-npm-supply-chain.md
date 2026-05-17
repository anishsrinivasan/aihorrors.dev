---
title: CanisterWorm Spreads Through NPM Packages, Steals Dev Credentials
date: 2026-04-22
severity: high
tags: [npm, supply-chain, malware, canisterworm, teampcp, namastex, credentials, crypto]
excerpt: Self-propagating malware infected multiple NPM packages from Namastex Labs, stealing API keys, SSH credentials, and crypto wallets from developer environments.
---

## What Happened

On April 22, 2026, security researchers discovered a sophisticated supply chain attack targeting the NPM ecosystem. Multiple packages from Namastex Labs, an agentic AI company, were compromised with self-propagating malware dubbed "CanisterWorm." The attack infected at least six packages including @automagik/genie, pgserve, and several @fairwords packages.

The malware was designed specifically to target developer environments rather than end users. Once installed, it immediately began harvesting sensitive credentials, API keys, SSH keys, and cryptocurrency wallet data from infected systems. The attack used an Internet Computer Protocol (ICP) canister as both a command-and-control infrastructure and data exfiltration endpoint.

What made this attack particularly dangerous was its worm-like behavior. The malware would search for NPM tokens on compromised developer machines, identify packages the victim could publish, inject malicious payloads, and republish them as new versions. This created a self-sustaining infection cycle that could rapidly spread through the NPM ecosystem.

## How It Happened

- **Initial Compromise**: Attackers gained access to Namastex Labs' NPM publishing accounts
- **Package Infection**: Malicious code was injected into legitimate packages during the build process
- **Install-Time Execution**: The malware activated immediately when developers installed the compromised packages
- **Credential Harvesting**: The payload scanned for tokens, API keys, SSH keys, and cloud service credentials
- **Crypto Targeting**: Browser extensions (MetaMask, Phantom) and local wallet files were specifically targeted
- **Self-Propagation**: Using stolen NPM tokens, the malware republished itself to additional packages
- **Data Exfiltration**: Stolen data was sent to both conventional webhooks and ICP canister endpoints

## Why This Matters

This attack represents a significant evolution in supply chain threats, combining traditional credential theft with autonomous propagation capabilities. The malware's ability to self-replicate through the NPM ecosystem means a single compromised developer could potentially infect dozens of additional packages.

"This is not just a credential stealer," warned Socket researchers. "It is designed to turn one compromised developer environment into additional package compromises." The attack specifically targeted the growing intersection between traditional development workflows and cryptocurrency/Web3 infrastructure, reflecting attackers' awareness of high-value assets in modern developer environments.

The incident also highlighted concerning code reuse patterns, with researchers noting "strong overlap" with previous TeamPCP/LiteLLM attacks, including explicit references to "TeamPCP/LiteLLM method" in the malicious payload. This suggests either the same threat actor or widespread sharing of attack tools among cybercriminals.

## Lessons Learned

- Supply chain attacks are becoming increasingly sophisticated with autonomous propagation capabilities
- Developer environments contain high-value targets including crypto assets and cloud credentials
- Package maintainer account security is critical to ecosystem integrity
- Self-propagating malware can rapidly amplify the impact of initial compromises
- The intersection of traditional dev tools and crypto infrastructure creates new attack surfaces

## Prevention Checklist

- [ ] Enable two-factor authentication on all package registry accounts (NPM, PyPI, etc.)
- [ ] Regularly audit and rotate API tokens and publishing credentials
- [ ] Implement dependency scanning tools that detect malicious packages before installation
- [ ] Use isolated development environments to limit blast radius of compromised packages
- [ ] Monitor for unexpected network connections from development tools and build processes
- [ ] Segregate cryptocurrency wallet access from primary development environments
- [ ] Set up alerts for unexpected package publications under your organization's namespace
- [ ] Regularly review package permissions and remove unused publishing access

---
**Original Source:** [The Register](https://www.theregister.com/2026/04/22/another_npm_supply_chain_attack/)
**Full details:** [Socket Security Research](https://socket.dev/blog/namastex-npm-packages-compromised-canisterworm)