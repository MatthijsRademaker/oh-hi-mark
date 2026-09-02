# oh-hi-mark

OHM (Open Harness Markdown) is planned as a local browser review workspace for LLM responses.

## Status

Scaffold only. `/ohm` is wired as a Pi and Claude entrypoint, but response capture, browser launch, Markdown rendering, and scratchpad persistence are not implemented.

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

- `.pi/` — canonical Pi package, extension stub, OpenSpec prompts, skills, rules, and settings.
- `.claude/` — Claude Code adapter and project-local `/ohm` command.
- `plugins/ohm/` — standalone Claude Code plugin scaffold.
- `.agents/` — agent work-product directories.
- `designs/` and `.devagent/docs/` — product and architecture notes.
- `openspec/` — OpenSpec change workflow.

Read [`AGENTS.md`](./AGENTS.md) before changing this repository.

## Validate scaffolding

```bash
claude plugin validate plugins/ohm
openspec list --json
```

The Vue workspace is intentionally not created yet. Build it as a separate OpenSpec change after the response contract and browser transport are agreed.
