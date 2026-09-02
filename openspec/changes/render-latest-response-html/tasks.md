## 1. Response capture and document generation

- [x] 1.1 Add pure latest-assistant-response extraction using active branch entries and stable session/entry identity.
- [x] 1.2 Add standalone HTML generation with escaped literal response text, metadata, responsive wrapping, and no executable or remote content.
- [x] 1.3 Add private temporary-file writing with deterministic response-specific paths and safe permissions.

## 2. Pi adapter

- [x] 2.1 Replace `/ohm` notification stub with response extraction, HTML writing, safe platform browser launch, and success/error notifications.
- [x] 2.2 Keep browser launch argument-based and local-only, with no shell interpolation or long-lived extension resources.

## 3. Verification and documentation

- [x] 3.1 Add focused built-in test coverage for response selection, escaping, identity, deterministic paths, and file output.
- [x] 3.2 Update Pi/project documentation to describe limited latest-response HTML behavior while retaining Claude and web scaffold boundaries.
- [x] 3.3 Run focused tests, type/LSP diagnostics, and repository validation; inspect generated HTML for hostile input.
