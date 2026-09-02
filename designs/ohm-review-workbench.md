# OHM review workbench

Status: Pi latest-response document view and ephemeral copyable scratchpad implemented.

## Product intent

Make long LLM responses easier to inspect without losing the agent conversation. The response is the primary document; the scratchpad is a parallel review surface, not a chat replacement.

## Implemented Pi slice

Current `/ohm` view is a polished responsive response-and-scratchpad layout with sticky metadata/actions, safe Markdown, local code highlighting, copy control, system/light/dark themes, and ephemeral notes with one-click agent-harness copy. It opens directly from private `file://` handoff and has no history, live refresh, or Claude capture.

## Layout direction

```text
┌─────────────────────────────────────────────────────────────┐
│ OHM · response metadata                         open / copy │
├───────────────────────────────────────┬─────────────────────┤
│                                       │                     │
│ rendered assistant response           │ review scratchpad   │
│ independently scrollable              │ independently       │
│                                       │ scrollable           │
│                                       │                     │
└───────────────────────────────────────┴─────────────────────┘
```

Desktop may use a split view. Narrow screens should stack response before scratchpad without hiding either surface or creating horizontal clipping.

## Interaction principles

- Preserve response identity across refreshes for clear response metadata.
- Keep response and scratchpad scroll positions independent.
- Keep scratchpad visible at desktop viewport bottom while long responses scroll.
- Keep notes in memory only; make copying them into the agent harness one action.
- Make copy, open-source, and note actions keyboard reachable.
- Keep metadata visible but subordinate to response content.
- Show source state clearly when no response has arrived.
- Treat links, raw HTML, images, and code as explicit trust boundaries.
- Respect reduced-motion preferences.

## Web stack

Vue 3 + Vite + Bun, Tailwind CSS v4, and shadcn-vue source components. Markdown pipeline uses `markdown-it`, explicit local Shiki grammars/themes, and final DOMPurify sanitization. Raw response HTML is disabled and Markdown images become inert placeholders.

## Open questions

- Should future live refresh replace current Pi `file://` handoff with localhost HTTP or WebSocket transport?
- Should response history be session-scoped, project-scoped, or one latest response only?
- Which Claude transcript events expose enough data for parity with Pi?
- How should oversized responses and binary attachments be handled?
