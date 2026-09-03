## Why

Long assistant responses are difficult to inspect in terminal output. Implement the first useful `/ohm` slice now: capture the current Pi session's latest assistant text and make it available as a local standalone HTML document.

## What Changes

- Replace Pi `/ohm` notification stub with a command that:
  - selects the latest assistant message on the active session branch;
  - writes a standalone HTML file in a local temporary directory;
  - escapes assistant text before embedding it in HTML;
  - opens the generated file with an argument-based platform browser helper;
  - reports the generated file path or actionable failure in Pi UI.
- Keep output latest-response-only and render text as text, preserving line breaks without interpreting Markdown or HTML.
- Add focused tests for assistant selection, HTML escaping, document generation, and missing-response errors.
- Update scaffold documentation to describe this limited Pi-only implementation.

Non-goals for this change:

- Markdown parsing, syntax highlighting, or richer review UI.
- Scratchpad persistence, response history, or response refresh transport.
- Claude Code transcript capture or Claude adapter implementation.
- Local HTTP server, telemetry, remote transport, or browser-side scripting.

## Capabilities

### New Capabilities

- `latest-response-html`: Create and open a safe standalone HTML document containing the latest assistant response from the active Pi branch.

### Modified Capabilities

<!-- No existing capability specifications exist. -->

## Impact

- `.pi/extensions/ohm/` gains Pi command, HTML generation, and response-selection logic.
- Pi runtime uses `ctx.sessionManager` for branch data and `openBrowser()` for platform-safe file opening.
- Test tooling is added only if needed for focused extension tests; no frontend dependencies are introduced.
- Pi documentation and project status text change from scaffold-only to limited Pi implementation. Claude and `web/` remain scaffold-only.
