# oh-hi-mark

OHM (Open Harness Markdown) is planned as a local browser review workspace for LLM responses.

## Status

Pi `/ohm` captures the active branch's latest assistant text and opens a polished local Vue review application from a private temporary file. The app renders sanitized Markdown, highlights common code languages with Shiki, provides system/light/dark themes and copy controls, and makes no response-triggered image requests.

Scratchpad notes stay in memory until copied into the agent harness. Claude capture, response history, and live refresh remain scaffolded.

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

## Validate repository

```bash
cd web && bun run test && bun run build
node --experimental-strip-types --test .pi/extensions/ohm/index.test.ts
claude plugin validate plugins/ohm
openspec list --json
```
