# OHM review app

Vue 3/Vite source for Pi `/ohm` local response review surface.

## Commands

Bun is package manager and script runner.

```bash
bun install
bun run dev
bun run typecheck
bun run test
bun run build
```

Production build writes committed runtime files to `.pi/extensions/ohm/generated/`. Build uses relative URLs plus file-protocol-safe classic IIFE output; do not switch entry back to external ES module, which Chromium blocks on `file://` pages.

## Response contract

App reads one non-executable JSON envelope from `#ohm-response`:

```ts
{
  responseId: string
  sessionId: string
  entryId: string
  text: string
}
```

Pi owns capture and safe envelope serialization. Browser app never reads harness session files.

## Markdown trust boundary

- `markdown-it` parses response with raw HTML disabled.
- DOMPurify sanitizes final generated HTML before `v-html` insertion.
- Markdown image sources become inert labeled placeholders.
- Links open separately with `noopener noreferrer`; unsafe protocols are omitted by parser/sanitizer policy.
- Shiki core packages explicit local grammars and GitHub light/dark themes. Unsupported fences use plaintext.
- Fonts, scripts, styles, icons, themes, and grammars are local. Response rendering performs no network fetches.

Packaged grammars: Bash, CSS, diff, Go, HTML, JavaScript, JSON, JSX, Markdown, Python, Rust, SQL, TSX, TypeScript, Vue, and YAML.

## Current scope

One latest Pi response, document-first review, responsive right-side scratchpad, response-keyed local note persistence, copy action, and system/light/dark preference. Response history, live refresh, Claude capture, and remote images remain out of scope.
