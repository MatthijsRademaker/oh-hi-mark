## Why

Literal `<pre>` output makes long assistant responses hard to scan and leaves OHM short of its core Markdown review goal. Build the first Vue review surface now so Pi `/ohm` opens a polished, local, safe document view.

## What Changes

- Scaffold the Bun-managed Vue 3 and Vite workspace under `web/`.
- Configure Tailwind CSS v4 and shadcn-vue with reusable registry components and semantic theme tokens.
- Render latest assistant response with `markdown-it`, Shiki syntax highlighting, and DOMPurify sanitization.
- Add an accessible document-first shell with response identity, copy action, light/dark theme control, responsive typography, and explicit handling for links, images, code, and overflow.
- Build browser assets into the Pi extension package and change `/ohm` to write a response-specific app entry document plus local assets before opening it.
- Add frontend, sanitizer, generated-handoff, and adapter verification.

Non-goals:

- Scratchpad, response history, live refresh, or persistence.
- Claude Code response capture or plugin implementation.
- Local HTTP/WebSocket servers, remote assets, telemetry, or network transport.

## Capabilities

### New Capabilities

- `markdown-review-app`: Render one response envelope as sanitized Markdown in a responsive local Vue review application.

### Modified Capabilities

- `latest-response-html`: Replace literal script-free document generation with a local bundled application handoff while preserving active-branch selection, stable response identity, private temporary output, and safe browser launch.

## Impact

- `web/` becomes a Vue/Vite/Bun workspace with frontend dependencies and generated build output.
- `.pi/extensions/ohm/` gains packaged browser assets and app-envelope injection/copy logic.
- `/ohm` output changes from literal escaped text to sanitized Markdown rendered by Vue.
- Claude adapter remains unchanged; Pi response extraction contract remains latest active-branch text only.
