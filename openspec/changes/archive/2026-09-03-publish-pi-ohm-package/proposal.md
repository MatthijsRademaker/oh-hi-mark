## Why

OHM `/ohm` works as a project-local Pi extension, but this repository is not yet a clean distributable Pi package. The root package is private and has no Pi manifest, while the nested `.pi` package includes internal project resources; a public release could therefore fail Git installation, ship unrelated files, or let packaged Vue assets drift from `web/`.

This change establishes a Pi-only package and release boundary before adding more OHM behavior.

## What Changes

- Make the repository installable as a public Pi package from npm and Git.
- Add public package metadata and an explicit Pi extension entry for the OHM `/ohm` command.
- Ship only the Pi runtime sources and committed generated browser assets required by `/ohm`.
- Keep `web/` as build source; require production builds to refresh `.pi/extensions/ohm/generated/` before release.
- Add generated-asset drift checks, package-content checks, and clean-install smoke coverage.
- Add a dedicated type-check or equivalent validation lane for Pi extension TypeScript.
- Document package installation, versioning, build, and release commands.
- Keep current latest-response behavior, private temporary-file handoff, safe Markdown rendering, and offline `file://` runtime unchanged.

Non-goals:

- Claude Code adapter or plugin distribution.
- Shared cross-harness transport.
- Response history, live refresh, persistent scratchpad, or local server.
- New browser features or a frontend rewrite.
- Building the Vue application at `/ohm` runtime.

## Capabilities

### New Capabilities

- `pi-extension-package`: Distribute OHM as an installable Pi package containing the `/ohm` extension and its matching generated local browser application.

### Modified Capabilities

<!-- No existing repository-level capability specifications require behavior changes. -->

## Impact

- Root `package.json` gains public package metadata, Pi resource manifest, package allowlist, and release validation scripts.
- `.pi/extensions/ohm/` remains the Pi runtime boundary and continues to contain generated application output.
- `.pi/package.json` and project-local settings remain available for repository development but are not the public package surface.
- `web/` build configuration remains the source of truth for browser assets and gains release consistency checks.
- Tests and CI gain extension type validation, generated-output drift validation, packed-artifact inspection, and Pi install smoke coverage.
- Runtime dependencies remain Pi-provided core packages plus Node built-ins; frontend dependencies stay build-time only.
- No Pi command, response envelope, or browser handoff API changes are intended.
