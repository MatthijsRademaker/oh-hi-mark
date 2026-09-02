---
name: browser-verification
description: Verify OHM browser review behavior, safe Markdown rendering, scratchpad interaction, and responsive layouts.
license: MIT
compatibility: Requires the future Bun-managed `web/` workspace and its browser test dependencies.
metadata:
  author: oh-hi-mark
  version: "0.1"
---

# OHM browser verification

Use this skill for browser behavior, visual inspection, and accessibility claims once `web/` exists.

## Completion lane

The future completion lane should run from `web/` with the repository-pinned Bun commands and browser suite. Until that workspace is scaffolded, validate only configuration and adapter contracts; do not claim browser coverage.

## Review checklist

- Latest response renders as text and Markdown without executing response-provided HTML or scripts.
- Code blocks, links, images, and oversized content have explicit behavior.
- Response and scratchpad scroll independently.
- Scratchpad state is keyed to response identity.
- Keyboard focus and narrow viewport behavior remain usable.
- Console, page, and request failures are treated as failures.
- Reduced-motion behavior remains usable.
