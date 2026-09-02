# AGENTS.md

Project-wide instructions for coding agents. `CLAUDE.md` points here so Pi and Claude Code use one source of truth.

## Project

OHM (Open Harness Markdown) is a local review workspace for LLM output. The intended product flow is:

1. The coder invokes `/ohm` from an agent harness.
2. The latest assistant response is handed to a local browser workspace.
3. The response is rendered as safe, readable Markdown.
4. A scratchpad stays available while the coder scrolls and reviews.

Full OHM workspace remains scaffolded. Pi `/ohm` now captures the latest text response on the active branch, writes escaped standalone HTML in the OS temporary directory, and requests the default browser to open it. Claude capture, Vue review UI, Markdown rendering, and scratchpad persistence are not implemented.

## Working rules

### Think before coding

State assumptions. Ask when requirements materially affect the design. Push back when a simpler approach exists. Stop when confused.

### Simplicity first

Build the smallest verified change. Avoid speculative abstractions and dependencies.

### Surgical changes

Touch only required files. Match existing style. Do not refactor adjacent code without a reason tied to the task.

### Fail fast

Invalid states must be visible. Propagate errors with useful context. Do not swallow exceptions, return fake success, or hide unsupported states behind silent fallbacks.

### No compatibility theater

Do not preserve old APIs, paths, flags, or schemas unless the task requires them. Replace obsolete paths and delete dead code.

### DRY, carefully

Remove duplicated domain logic, but do not create abstractions for superficial similarity. Duplication is safer than a wrong abstraction.

### Keep files navigable

Prefer small, feature-descriptive files with one clear responsibility. Split files before they become unwieldy. Avoid generic buckets such as `utils`, `helpers`, and `misc`.

### Verify

Define success criteria before implementation. Run the narrowest relevant checks, then the full configured verification lane before claiming completion. Use `rg`, not `grep`.

## Repository map

| Path | Purpose |
|---|---|
| `web/` | Future Vue review suite. Scaffold only until its package manifest exists. |
| `designs/` | Product and interaction decisions for the review workspace. |
| `.devagent/docs/` | Internal architecture and roadmap notes. |
| `.agents/` | Human/agent work products: TODOs, findings, handoffs, and reports. |
| `.pi/` | Canonical Pi resources: extensions, prompts, skills, rules, and settings. |
| `.claude/` | Claude Code adapter and project-local commands; shared resource directories mirror `.pi/`. |
| `plugins/ohm/` | Standalone Claude Code plugin distribution scaffold. |
| `openspec/` | OpenSpec changes and capability specs. |

## Agent configuration

- Edit Pi resources under `.pi/`; do not edit `.claude` symlink targets through an alternate path.
- `.pi/extensions/ohm/` contains the limited Pi `/ohm` command. It writes escaped latest-response HTML and opens the local file; full review workspace behavior remains future work.
- `.claude/commands/ohm.md` is the project-local Claude command stub.
- `plugins/ohm/` is portable Claude plugin structure. Keep it usable with `claude --plugin-dir ./plugins/ohm`.
- Keep Pi and Claude adapter behavior aligned, but do not pretend their runtime APIs are interchangeable.
- Treat LLM response text as untrusted content. Current HTML handoff escapes response text and executes no response-provided HTML or scripts; future Markdown rendering must use an explicit sanitizer.
- Keep browser transport local by default. Do not introduce telemetry, remote hosting, or network dependencies without an explicit decision.

## Frontend direction

The future `web/` suite uses Vue 3, Vite, and Bun. Markdown rendering should use a maintained parser with explicit sanitization and syntax highlighting. The first design candidate is `markdown-it` + `DOMPurify` + Shiki; confirm this in an implementation proposal before adding dependencies.

Read `designs/ohm-review-workbench.md` before changing review layout, scrolling, scratchpad behavior, or visual language. Preserve:

- independent response and scratchpad scrolling;
- stable response identity for saved notes;
- keyboard accessibility and visible focus;
- responsive behavior without horizontal clipping;
- safe handling of Markdown, links, code, and images.

## OpenSpec workflow

Use `/opsx-explore` for discovery, `/opsx-propose` for a scoped change, `/opsx-apply` for implementation, and `/opsx-archive` after completion. Keep proposal, design, specs, and tasks aligned when scope changes.

OpenSpec review tooling is not installed here. Do not add `.openspec-doc/`, review hooks, or project-specific dashboard configuration unless explicitly requested.
