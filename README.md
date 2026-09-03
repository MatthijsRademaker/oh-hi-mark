# oh-hi-mark

OHM (Open Harness Markdown) is a local browser review workspace for Pi assistant responses.

## Status

Pi `/ohm` captures the active branch's latest assistant text and opens a polished local Vue review application from a private temporary file. The app renders sanitized Markdown, highlights common code languages with Shiki, provides system/light/dark themes and copy controls, and makes no response-triggered image requests.

Scratchpad notes stay in memory until copied into the agent harness. Claude capture, response history, and live refresh remain scaffolded.

## Install as Pi package

Requires Pi 0.84.4+ and Node.js 22.19+. Pi supplies the host extension API; OHM ships its browser application and runtime assets locally.

Install from npm:

```bash
pi install npm:oh-hi-mark@0.1.0
```

Install from Git:

```bash
pi install git:github.com/MatthijsRademaker/oh-hi-mark@v0.1.0
```

Run `/reload` after installing or updating while Pi is open. Then run `/ohm` after an assistant response exists on the active branch. OHM writes response-specific HTML and copied assets under a private temporary directory, then opens an absolute `file://` path in the platform browser.

No Bun, Vite, frontend dependency install, local server, CDN, or response-triggered network request is required at runtime. Review extension source before installing: Pi packages execute with full host permissions and can read or modify local files.

## Planned flow

```text
Pi / Claude /ohm
       │
       ▼
latest assistant response
       │
       ▼
local transport + Vue review suite
       ├── safe Markdown rendering
       └── copyable review scratchpad
```

## Repository setup

- `.pi/` — canonical Pi package, latest-response review extension and generated web assets, OpenSpec prompts, skills, rules, and settings.
- `.claude/` — Claude Code adapter and project-local `/ohm` command.
- `plugins/ohm/` — standalone Claude Code plugin scaffold.
- `.agents/` — agent work-product directories.
- `designs/` and `.devagent/docs/` — product and architecture notes.
- `openspec/` — OpenSpec change workflow.

Read `AGENTS.md` before changing this repository.

## Build

Requires Bun 1.3+. Run commands from repository root; scripts install locked web dependencies and delegate to `web/`.

```bash
bun run dev
bun run test
bun run typecheck
bun run build
bun run verify
```

`bun run build` writes packaged runtime assets to `.pi/extensions/ohm/generated/`. `/ohm` needs no development server or runtime frontend install. For direct frontend work, run same scripts from `web/` after `bun install`.

Release source lane:

```bash
bun install --frozen-lockfile
bun run release:source
```

`release:source` installs frozen web dependencies, runs web typecheck/tests/build, validates generated output and committed parity, then runs Pi typecheck/tests. Full package validation is documented in `RELEASING.md`.

## Validate repository

```bash
bun run package:inspect
bun run package:smoke
bun run git:smoke
bun run browser:smoke
claude plugin validate plugins/ohm
openspec list --json
```

`browser:smoke` needs Chrome or Chromium. Set `OHM_BROWSER_BIN` when executable is not on `PATH`.
