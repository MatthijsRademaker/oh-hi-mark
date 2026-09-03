## Context

Current Pi `/ohm` extracts latest assistant text, escapes it into a handwritten standalone document, and opens a private temporary file. Repository has no Vue runtime, shared response envelope, or Markdown trust boundary. Change crosses Pi adapter packaging, static file handoff, and browser rendering while retaining latest-active-branch capture.

Assistant text, Markdown links, image destinations, and raw HTML are untrusted. Browser app must make no remote startup requests and must remain usable from `file://` without a server.

## Goals / Non-Goals

**Goals:**

- Create Bun-managed Vue 3/Vite app using Tailwind CSS v4 and shadcn-vue.
- Render latest response as readable sanitized Markdown with local syntax highlighting.
- Package production browser assets with Pi extension and create deterministic private response documents.
- Preserve stable `sessionId:entryId` response identity across adapter and browser boundaries.
- Verify hostile Markdown, app handoff, responsive overflow, keyboard access, and build output.

**Non-Goals:**

- Scratchpad, history, refresh transport, Claude adapter, remote transport, or long-lived server.
- Arbitrary response attachments or remote image loading.
- Runtime editing of Markdown.

## Decisions

1. **Use static response envelope embedded in app entry HTML.**
   Pi writes `{ responseId, sessionId, entryId, text }` as escaped JSON in a non-executable `application/json` script element. Vue reads this explicit envelope and never reads Pi session files. Alternative rejected: query strings, which expose and truncate content; local server, which adds lifecycle and port security work.

2. **Build Vite output into a packaged Pi extension asset directory.**
   `web` remains source of truth. Production build emits hashed local assets plus index template under `.pi/extensions/ohm/generated/`. `/ohm` copies those assets into private temporary OHM directory, injects response envelope into response-specific index, then opens that index. Vite emits one classic IIFE entry and removes CORS-bearing asset attributes because Chromium blocks external ES modules and CORS-marked stylesheets on `file://` pages. Packaged output is committed because project-local Pi extension must work after checkout without starting Vite or installing frontend dependencies at command time. Alternative rejected: CDN imports, runtime build, or local server.

3. **Use maintained Markdown trust pipeline.**
   `markdown-it` parses with raw HTML disabled, Shiki renders fenced code with bundled themes/languages, and DOMPurify sanitizes final HTML before Vue `v-html`. Link rendering allows safe browser protocols and adds `rel="noopener noreferrer"`; image syntax becomes inert labeled placeholders, preventing response-triggered network requests. Alternative rejected: custom Markdown parser or regex sanitization.

4. **Use shadcn-vue as source components, not runtime package widgets.**
   Initialize shadcn-vue against Tailwind v4, neutral semantic CSS variables, Reka base, and Lucide icons. Add only components used by review shell. App composition remains project-owned while primitives follow registry APIs. Alternative rejected: custom button/badge primitives.

5. **Keep document-first single-pane scope.**
   Response fills readable centered column with sticky metadata/actions, clear typography, horizontal code scrolling, copy action, and persisted system/light/dark preference. Narrow screens keep all controls reachable and avoid page-level horizontal clipping. Scratchpad split is deferred to its own response-keyed change.

6. **Fail visibly at every boundary.**
   Missing/malformed envelope shows application error state. Missing packaged build assets causes `/ohm` write failure with source path context. Clipboard failure is announced. No silent literal-text fallback hides broken Markdown pipeline.

## Risks / Trade-offs

- **[Committed generated assets can drift from `web/`]** → Build verification regenerates assets and fails on differences; package output path is explicit.
- **[Shiki increases bundle size]** → Use Shiki core with explicit imports for 16 common grammars, two themes, and plaintext fallback; accept roughly 2.2 MB local package cost for high-quality highlighting.
- **[`file://` browser behavior differs]** → Use relative same-directory assets and file-safe classic bundle, avoid fetch/module data transport, and verify generated file directly in Chromium.
- **[Sanitizer regression could expose untrusted markup]** → Disable parser HTML, sanitize final output, test hostile links/HTML/events, and keep image loading inert.
- **[Theme preference uses browser-local state]** → Treat preference as presentation-only and tolerate unavailable storage without masking render errors.

## Migration Plan

1. Scaffold and test `web/`, then produce packaged extension assets.
2. Replace literal HTML renderer with envelope injection and asset copy while retaining existing response path and permissions.
3. Reload Pi extension and invoke `/ohm`; old generated files remain harmless and can be removed by OS cleanup.
4. Roll back by restoring prior `html.ts` and removing packaged assets/web workspace; no persisted user schema changes.

## Open Questions

None for latest-response-only static handoff.
