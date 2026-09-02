---
name: ohm
description: Use when working on OHM's local browser review workspace, response handoff, Markdown rendering, or scratchpad behavior.
---

# OHM plugin skill

OHM is a local review workspace for LLM output. This plugin is scaffold-only.

Before implementation, read the repository's `AGENTS.md`, `designs/ohm-review-workbench.md`, and `.devagent/docs/architecture.md`. Keep Claude Code adapter behavior aligned with the Pi adapter without assuming their lifecycle APIs are identical. Never execute or trust HTML supplied by an assistant response.
