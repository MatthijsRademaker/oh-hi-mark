# oh-hi-mark

OHM (Open Harness Markdown) is planned as a local browser review workspace for LLM responses.

## Status

Limited Pi slice. `/ohm` captures the active branch's latest assistant text, writes escaped standalone HTML under the OS temporary directory, and opens the default browser. Claude capture, Vue review UI, Markdown rendering, and scratchpad persistence remain scaffolded.

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
       └── synchronized review scratchpad
```

## Repository setup

- `.pi/` — canonical Pi package, latest-response HTML extension, OpenSpec prompts, skills, rules, and settings.
- `.claude/` — Claude Code adapter and project-local `/ohm` command.
- `plugins/ohm/` — standalone Claude Code plugin scaffold.
- `.agents/` — agent work-product directories.
- `designs/` and `.devagent/docs/` — product and architecture notes.
- `openspec/` — OpenSpec change workflow.

Read [`AGENTS.md`](./AGENTS.md) before changing this repository.

## Validate repository

```bash
node --experimental-strip-types --test .pi/extensions/ohm/index.test.ts
claude plugin validate plugins/ohm
openspec list --json
```

The Vue workspace is intentionally not created yet. Build it as a separate OpenSpec change after the response contract and browser transport are agreed.
