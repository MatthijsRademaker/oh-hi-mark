## Context

The Vue app currently renders one embedded latest-response envelope in a centered document column. The review layout already treats assistant Markdown as untrusted and exposes stable `responseId` identity. This change adds a browser-only ephemeral note surface without changing Pi capture, local file transport, or response parsing.

## Goals / Non-Goals

**Goals:**

- Keep response content primary while placing notes in a desktop right column.
- Keep note editor usable while long response document scrolls.
- Stack response before notes below desktop layout width.
- Keep notes in component memory only.
- Make clipboard failure visible while retaining in-memory editing.

**Non-Goals:**

- Any local, filesystem, or cross-device persistence.
- Response history, live transport, or collaborative notes.
- Markdown rendering or HTML insertion for note content.

## Decisions

1. **Use a dedicated `Scratchpad` Vue component.** The component owns editor state, clipboard action, accessibility, and copy feedback; `App.vue` only renders the surface. Alternative rejected: placing note state in the shell, which couples layout with copy behavior.

2. **Keep notes ephemeral.** The component stores note text only in reactive memory and clears it when component is recreated. Alternative rejected: browser or filesystem storage, which would preserve review content against the requested copy-only workflow and blur the web/adapter boundary.

3. **Use a CSS grid plus desktop sticky positioning.** The response remains the first grid item; the scratchpad is the second and uses a viewport-relative sticky top inset that keeps its card near the bottom-right during long document scroll. At narrow widths, the grid becomes one column and sticky positioning is removed so neither surface is hidden or clipped. The textarea has its own bounded vertical overflow.

4. **Copy on explicit action and report clipboard feedback.** A dedicated button copies the exact textarea text for pasting into the agent harness; empty notes disable the action. Clipboard failures switch visible status to an error while preserving the current note in component memory. Notes are never rendered as HTML.

## Risks / Trade-offs

- **[Clipboard APIs can fail in private or restricted browser contexts]** → Report copy failure visibly and keep note text editable for retry.
- **[Clipboard format could be altered by a harness]** → Copy raw textarea text without HTML conversion or response metadata.
- **[Sticky positioning varies with viewport height]** → Bound editor height, use a minimum top inset, and disable sticky behavior at narrow widths.

## Migration Plan

No response envelope or adapter migration is required. New builds include the component; existing response-specific files render with an empty note editor. No browser keys or other persistence data are created.

## Open Questions

None for this ephemeral, latest-response-only implementation.
