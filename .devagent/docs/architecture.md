# OHM architecture scaffold

## Boundary

```text
agent harness
  ├── Pi extension
  └── Claude Code plugin/command
          │
          ▼
   response envelope
          │
          ▼
 local browser transport
          │
          ▼
 Vue review suite
  ├── rendered Markdown
  └── coder scratchpad
```

Adapters should produce one shared response envelope. The web suite should not read Pi or Claude session files directly.

## Boundaries

- **Pi adapter:** observes current session branch, selects latest assistant text, creates explicit response envelope, and invokes local review transport from `/ohm`.
- **Claude adapter:** will use Claude Code command and hook contracts to identify current transcript and latest assistant response.
- **Transport:** Pi currently uses deterministic private `file://` handoff keyed by response identity. Long-lived refresh transport remains future work.
- **Web:** Vue application renders one embedded envelope, owns ephemeral scratchpad note state, and copies notes to the clipboard for agent-harness pasting.

## Current state

Pi `/ohm` produces `{ responseId, sessionId, entryId, text }`, safely embeds envelope in packaged Vue application entry, copies trusted local assets beneath OS temporary directory, and requests platform browser to open response-specific file. Vite emits a file-protocol-safe classic bundle because Chromium blocks external ES modules from `file://` pages.

Browser app uses `markdown-it` with raw HTML disabled, Shiki core with explicit local grammars/themes, final DOMPurify sanitization, inert image placeholders, and no remote startup dependencies. It provides document-first response view, responsive sticky scratchpad, ephemeral notes with agent-harness copy, responsive overflow behavior, and system/light/dark themes.

Claude adapter, shared cross-harness transport, response history, and live refresh do not exist yet.
