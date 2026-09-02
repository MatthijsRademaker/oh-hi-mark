# Pi project configuration

`.pi/` is the canonical project-local Pi package. It follows Pi's package layout and is loaded through `.pi/settings.json`.

| Path | Purpose |
| --- | --- |
| `extensions/` | Pi TypeScript extensions, including the `/ohm` latest-response HTML command |
| `prompts/` | OpenSpec prompt templates |
| `skills/` | OpenSpec and OHM-specific agent skills |
| `rules/` | Project guardrails shared with Claude Code |
| `agents/` | Reserved for future named agent definitions |
| `settings.json` | Project-local Pi settings |
| `package.json` | Pi package manifest |

Pi loads this project only after project trust is granted. Run `/reload` after changing extension resources.

`extensions/ohm/` reads the active Pi branch, writes escaped latest-response text to standalone HTML under the OS temporary directory, and opens that file with the platform default handler. Markdown rendering, scratchpad, history, and shared transport remain future work.
