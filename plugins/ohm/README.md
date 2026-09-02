# OHM Claude Code plugin

Standalone Claude Code plugin scaffold. Validate it with:

```bash
claude plugin validate plugins/ohm
```

Try it in a Claude Code session with:

```bash
claude --plugin-dir ./plugins/ohm
```

The plugin currently exposes only a documented namespaced `/ohm:ohm` command and a placeholder skill. The project-local `.claude/commands/ohm.md` provides the direct `/ohm` entrypoint. The plugin does not capture transcripts, start a browser, run a local server, or persist scratchpad content.

Claude Code and Pi use different extension contracts. Keep this plugin adapter separate from `.pi/extensions/ohm/`, then converge both on the response envelope and local transport described in `../../.devagent/docs/architecture.md`.
