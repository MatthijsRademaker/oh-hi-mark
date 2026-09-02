---
name: frontend-design
description: Design or restyle the OHM Vue review workspace with document-first hierarchy, accessible interaction, safe Markdown surfaces, and responsive behavior.
license: MIT
compatibility: Requires this repository and its future Bun-managed `web/` workspace.
metadata:
  author: oh-hi-mark
  version: "0.1"
---

# OHM frontend design

Use this skill for visual or interaction work under `web/`.

## Required reading

Read `designs/ohm-review-workbench.md` before choosing layout, scrolling, typography, color, or motion. Read `.devagent/docs/architecture.md` before changing boundaries between adapters, transport, and UI.

## Product constraints

- Keep assistant response content primary; scratchpad is a parallel review surface, not a chat replacement.
- Keep response and scratchpad scrolling independent.
- Preserve response identity so notes cannot attach to a different response after refresh.
- Use semantic tokens instead of component-local status colors.
- Provide landmarks, logical headings, accessible names, visible focus, keyboard access, and reduced-motion behavior.
- Test wide and narrow layouts; never solve overflow by hiding essential content.
- Treat Markdown, links, raw HTML, images, and code as untrusted input. Sanitize explicitly before rendering.
- Avoid CDN-only assets, remote fonts, and remote icon dependencies.

No Vue application exists in this scaffold. Do not invent verification commands until `web/package.json` exists.
