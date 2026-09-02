# Pi project configuration

`.pi/` is the canonical project-local Pi package. It follows Pi's package layout and is loaded through `.pi/settings.json`.

| Path | Purpose |
|---|---|
| `extensions/` | Pi TypeScript extensions, including the `/ohm` scaffold command |
| `prompts/` | OpenSpec prompt templates |
| `skills/` | OpenSpec and OHM-specific agent skills |
| `rules/` | Project guardrails shared with Claude Code |
| `agents/` | Reserved for future named agent definitions |
| `settings.json` | Project-local Pi settings |
| `package.json` | Pi package manifest |

Pi loads this project only after project trust is granted. Run `/reload` after changing extension resources.

The browser bridge is intentionally absent. `extensions/ohm/` registers `/ohm` and reports scaffold status without reading or writing session output.
