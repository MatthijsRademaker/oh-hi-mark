---
name: ohm-review-workbench
description: Design or implement OHM response capture, local browser transport, Markdown review, or response-keyed scratchpad behavior.
license: MIT
compatibility: Requires this repository.
metadata:
  author: oh-hi-mark
  version: "0.1"
---

# OHM review workbench

Read these sources before making a feature change:

1. `AGENTS.md`
2. `designs/ohm-review-workbench.md`
3. `.devagent/docs/architecture.md`
4. Relevant OpenSpec artifacts under `openspec/`

## Boundary rules

- Pi and Claude adapters may differ internally but must converge on one response envelope.
- The web suite must consume the envelope through a local transport, not parse harness session files directly.
- Response identity must be stable and explicit.
- Assistant output is untrusted content. Sanitize at the rendering boundary.
- Keep the first implementation latest-response-only unless a proposal explicitly adds history.
- `/ohm` has a limited Pi-only HTML handoff. Do not describe full OHM workspace as functional until shared transport, Vue browser workspace, and scratchpad tests exist.
