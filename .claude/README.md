# Claude Code project configuration

Project-local Claude resources live here. Shared resource directories mirror canonical Pi resources under `.pi/`; edit `.pi/` rather than a symlinked path.

- `commands/ohm.md` — direct project-local `/ohm` stub.
- `commands/opsx/` — OpenSpec command templates.
- `agents`, `extensions`, `prompts`, `rules`, and `skills` — links to `.pi/`.
- `plugins/ohm/` — standalone plugin scaffold for `claude --plugin-dir ./plugins/ohm`.

No Claude settings or hooks are enabled by this scaffold.
