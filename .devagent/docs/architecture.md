# OHM architecture scaffold

## Boundary

```text
agent harness
  ├── Pi extension
  └── Claude Code plugin/command
          │
          ▼
   response envelope
          │
          ▼
 local browser transport
          │
          ▼
 Vue review suite
  ├── rendered Markdown
  └── coder scratchpad
```

Adapters should produce one shared response envelope. The web suite should not read Pi or Claude session files directly.

## Future boundaries

- **Pi adapter:** observe the current session branch, select latest assistant content, and invoke the local review transport from `/ohm`.
- **Claude adapter:** use Claude Code command and hook contracts to identify the current transcript and latest assistant response.
- **Transport:** local-only endpoint or file-backed handoff with explicit response identity and lifecycle.
- **Web:** Vue application that renders the envelope and stores scratchpad text keyed by response identity.

## Current state

No response envelope, transport, Vue application, or hook implementation exists yet. Keep this document architectural; implementation belongs in an OpenSpec change.
