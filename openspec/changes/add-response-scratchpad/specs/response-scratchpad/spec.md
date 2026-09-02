## ADDED Requirements

### Requirement: Provide response-keyed scratchpad

The browser review application MUST render an accessible scratchpad alongside each valid assistant response. It MUST keep response content as primary surface, place scratchpad to the right on desktop, and stack scratchpad after response on narrow viewports without page-level horizontal clipping.

#### Scenario: Desktop response review

- **WHEN** application opens a valid response at desktop width
- **THEN** assistant response appears in left content column and scratchpad appears in right column with a visible heading and note editor

#### Scenario: Narrow response review

- **WHEN** application width is below desktop layout width
- **THEN** response remains first, scratchpad follows it, and neither surface requires horizontal page scrolling

### Requirement: Keep scratchpad available during long response scroll

The desktop scratchpad MUST remain positioned near the viewport bottom-right while its containing response document is substantially longer than the viewport. The note editor MUST retain its own vertical scrolling so long notes do not expand the panel without limit.

#### Scenario: Long response

- **WHEN** user scrolls through a response longer than the viewport
- **THEN** scratchpad remains visible near the desktop viewport bottom-right until response container ends

#### Scenario: Long notes

- **WHEN** note content exceeds editor height
- **THEN** editor scrolls vertically while scratchpad frame and response layout remain usable

### Requirement: Persist notes by response identity

The scratchpad MUST save note text to browser-local storage using stable response identity and MUST load only notes belonging to currently displayed response. It MUST expose a visible session-only status when browser storage is unavailable while retaining edits in memory.

#### Scenario: Existing response note

- **WHEN** response with previously saved identity is opened
- **THEN** its saved note is restored in scratchpad editor

#### Scenario: Different response

- **WHEN** response identity changes to one with no saved note
- **THEN** scratchpad is empty and notes from another response are not shown

#### Scenario: Storage unavailable

- **WHEN** browser-local storage read or write fails
- **THEN** scratchpad remains editable and visibly reports that notes are session-only

### Requirement: Expose accessible note editing

The scratchpad MUST expose a logical heading, an accessible name for its textarea, visible focus treatment, and live persistence status. Note text MUST remain plain textarea content and MUST NOT be interpreted as HTML.

#### Scenario: Keyboard note entry

- **WHEN** user reaches scratchpad with keyboard
- **THEN** note editor receives focus, exposes its accessible name, and accepts text without requiring pointer interaction
