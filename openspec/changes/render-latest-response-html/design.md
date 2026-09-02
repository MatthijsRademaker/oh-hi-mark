## Context

Pi currently exposes `/ohm` as a notification-only project-local extension. Pi provides the active session branch through `ctx.sessionManager`. The repository has no web application or package manifest, so this slice must stay inside the Pi extension and use Node built-ins only; it will include a small argument-based platform browser launcher because Pi's internal `openBrowser()` helper is not part of its public extension API.

Assistant output is untrusted. The generated document must display response text without allowing response content to become markup, attributes, scripts, or external resources. The active branch is the source of truth; entries from abandoned branches must not be selected.

## Goals / Non-Goals

**Goals:**

- Extract latest assistant text from active Pi branch.
- Give each extracted response explicit identity using session ID plus session entry ID.
- Generate deterministic, standalone HTML with escaped response text and preserved line breaks.
- Store output in a private temporary OHM directory and open it through Pi's browser helper.
- Keep extraction and HTML generation pure enough for focused tests.
- Surface missing-response and file-generation errors to the user.

**Non-Goals:**

- Markdown rendering or sanitization pipeline; this version intentionally displays literal response text.
- A long-lived HTTP transport, Vue app, polling, history, or scratchpad.
- Claude Code capture or shared adapter implementation.
- Starting servers, watchers, or other long-lived resources.

## Decisions

1. **Read active branch through `ctx.sessionManager.getBranch()`.**
   The command must honor Pi tree navigation, unlike scanning session files or all entries. Walk the returned branch from newest to oldest and select the newest assistant message containing text blocks. This avoids treating a tool-call-only assistant message as reviewable response content. Alternative rejected: reading JSONL directly, which duplicates Pi session parsing and can select inactive branches.

2. **Use session entry ID as response identity.**
   Build `responseId` from `ctx.sessionManager.getSessionId()` and the selected message entry ID. The identity is embedded in document metadata and used in the filename, making repeated opens of one response deterministic while preventing collisions across sessions. Alternative rejected: timestamp-only identity, which is less stable and can collide.

3. **Render literal text in `<pre>`, with explicit HTML escaping.**
   Escape `&`, `<`, `>`, `"`, and `'` before inserting text. Use CSS `white-space: pre-wrap` and `overflow-wrap: anywhere` to preserve line breaks without horizontal clipping. Do not parse Markdown, permit raw HTML, add scripts, or load remote assets. Alternative rejected: `innerHTML`/Markdown conversion, which expands the trust boundary before a maintained sanitizer exists.

4. **Write one file per response under `os.tmpdir()/ohm`.**
   Create the directory with mode `0700` and use a filename containing only fixed characters plus validated session/entry IDs. Repeated `/ohm` calls overwrite the same response file. Alternative rejected: project-root output, which pollutes repositories and can expose response content to source-control tooling.

5. **Open with a local `openBrowser(outputPath)` helper and notify with the path.**
   The helper maps platform to `open`, `rundll32 url.dll,FileProtocolHandler`, or `xdg-open`, passing output path as one argument to `spawn()` with no shell. Browser launch remains best-effort; successful file generation is reported even if platform launcher cannot open a browser. Alternative rejected: shelling out through a command string, which creates avoidable command-injection risk.

6. **Keep Claude and web scaffolds unchanged.**
   This is a Pi-only first slice. The generated HTML acts as the temporary local handoff for now, while future envelope/transport/web work remains separate.

## Risks / Trade-offs

- **[Response content may be very large]** → Write full text to disk; do not route it through tool output or terminal UI. Browser remains responsible for scrolling.
- **[Temporary files can contain sensitive assistant output]** → Use a private directory and predictable latest-response-only overwrite behavior; users or OS cleanup may remove files.
- **[Browser launch may fail on a host]** → Notify with the absolute path after writing so user can open it manually.
- **[No Markdown formatting in first slice]** → Preserve literal content intentionally; defer parser and sanitizer choices to web implementation proposal.
- **[Pi API changes]** → Isolate Pi-specific session access and browser invocation in command adapter; test pure helpers independently.

## Migration Plan

Replace existing notification behavior. No persisted schema or server migration exists. If needed, rollback by restoring the stub command; generated files can be removed from the OS temporary directory.

## Open Questions

None for this limited implementation. Markdown, transport, browser workspace, and scratchpad decisions remain future changes.
