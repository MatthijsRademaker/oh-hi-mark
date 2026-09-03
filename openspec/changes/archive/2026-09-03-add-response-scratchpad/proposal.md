## Why

Long responses need a place for review notes that stays available while content scrolls. Add an ephemeral scratchpad with one-click copy so notes can move into the agent harness without expanding persistence or transport scope.

## What Changes

- Add responsive desktop split layout with assistant response left and scratchpad right.
- Keep scratchpad visible near desktop viewport bottom while long response content scrolls.
- Stack response before scratchpad on narrow screens without horizontal clipping.
- Keep notes in component memory only; save nothing locally.
- Add accessible note editor and one-click clipboard copy for agent-harness pasting.
- Add component and integration tests for rendering, copy feedback, and ephemeral behavior.
- Regenerate packaged Pi browser assets.

Non-goals:

- Response history, live refresh, or shared transport.
- Claude capture or adapter changes.
- Server-side, filesystem, or remote note persistence.

## Capabilities

### New Capabilities

- `response-scratchpad`: Provide an accessible ephemeral note editor with responsive layout, independent note scrolling, and clipboard copy for agent-harness pasting.

### Modified Capabilities

None.

## Impact

- `web/src/App.vue` and `web/src/style.css` gain review layout integration and responsive positioning.
- `web/src/components/Scratchpad.vue` owns note editing, clipboard copy, and feedback state.
- Frontend tests cover scratchpad behavior without storage; packaged `.pi/extensions/ohm/generated/` assets change.
- No Pi adapter API, response envelope, dependency, or network behavior changes.
