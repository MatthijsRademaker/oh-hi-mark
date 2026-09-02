## Context

The Vue app currently renders one embedded latest-response envelope in a centered document column. The review layout already treats assistant Markdown as untrusted and exposes stable `responseId` identity. This change adds a browser-only note surface without changing Pi capture, local file transport, or response parsing.

## Goals / Non-Goals

**Goals:**

- Keep response content primary while placing notes in a desktop right column.
- Keep note editor usable while long response document scrolls.
- Stack response before notes below desktop layout width.
- Scope persistence to exact response identity.
- Make storage failure visible while retaining in-memory editing.

**Non-Goals:**

- Cross-device or filesystem persistence.
- Response history, live transport, or collaborative notes.
- Markdown rendering or HTML insertion for note content.

## Decisions

1. **Use a dedicated `Scratchpad` Vue component.** The component owns editor state, persistence, accessibility, and storage failure status; `App.vue` only supplies `responseId`. Alternative rejected: placing note state in the shell, which couples layout with response-specific storage behavior.

2. **Use `localStorage` with an `ohm-scratchpad:<responseId>` key.** Browser-local storage survives response-specific file refreshes and prevents notes crossing response identities. Alternative rejected: one global key, which could attach old notes to new output; filesystem storage, which crosses the web/adapter boundary.

3. **Use a CSS grid plus desktop sticky positioning.** The response remains the first grid item; the scratchpad is the second and uses a viewport-relative sticky top inset that keeps its card near the bottom-right during long document scroll. At narrow widths, the grid becomes one column and sticky positioning is removed so neither surface is hidden or clipped. The textarea has its own bounded vertical overflow.

4. **Save on input and report storage fallback.** Synchronous local writes keep the latest note available without an extra save action. Storage exceptions switch visible status to session-only while preserving the current note in component memory. Notes are never rendered as HTML.

## Risks / Trade-offs

- **[Synchronous storage writes can occur for every keystroke]** → Keep note scope local and small; avoid adding debounce state until need is demonstrated.
- **[Response IDs can be long or contain unusual characters]** → Use them only as opaque storage key text; never interpolate them into HTML or executable code.
- **[Browser storage can be unavailable for private `file://` contexts]** → Catch storage errors and show session-only status instead of losing the editable note.
- **[Sticky positioning varies with viewport height]** → Bound editor height, use a minimum top inset, and disable sticky behavior at narrow widths.

## Migration Plan

No response envelope or adapter migration is required. New builds include the component; existing response-specific files render without stored notes. Removing the feature only leaves namespaced browser keys, which are harmless and can be cleared by browser storage cleanup.

## Open Questions

None for this browser-local, latest-response-only implementation.
