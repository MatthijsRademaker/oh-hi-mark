## Why

Long responses need a place for review notes that stays available while content scrolls. Add response-keyed scratchpad now so notes remain attached to exact assistant output across local refreshes without expanding transport scope.

## What Changes

- Add responsive desktop split layout with assistant response left and scratchpad right.
- Keep scratchpad visible near desktop viewport bottom while long response content scrolls.
- Stack response before scratchpad on narrow screens without horizontal clipping.
- Auto-save notes to browser-local storage under stable response identity.
- Show accessible note editor and visible storage fallback when persistence is unavailable.
- Add component and integration tests for rendering, persistence, and response isolation.
- Regenerate packaged Pi browser assets.

Non-goals:

- Response history, live refresh, or shared transport.
- Claude capture or adapter changes.
- Server-side, filesystem, or remote note persistence.

## Capabilities

### New Capabilities

- `response-scratchpad`: Provide an accessible response-keyed note editor with responsive layout, independent note scrolling, and local persistence.

### Modified Capabilities

None.

## Impact

- `web/src/App.vue` and `web/src/style.css` gain review layout integration and responsive positioning.
- `web/src/components/Scratchpad.vue` owns note editing and response-keyed browser storage.
- Frontend tests cover scratchpad behavior; packaged `.pi/extensions/ohm/generated/` assets change.
- No Pi adapter API, response envelope, dependency, or network behavior changes.
