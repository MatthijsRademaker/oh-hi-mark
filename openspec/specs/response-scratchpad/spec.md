# response-scratchpad Specification

## Purpose

TBD - created by archiving change add-response-scratchpad. Update Purpose after archive.

## Requirements

### Requirement: Provide ephemeral scratchpad

The browser review application MUST render an accessible ephemeral scratchpad alongside each valid assistant response. It MUST keep response content as primary surface, place scratchpad to the right on desktop, and stack scratchpad after response on narrow viewports without page-level horizontal clipping.

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

### Requirement: Keep notes ephemeral

The scratchpad MUST keep note text in component memory only and MUST NOT write notes to browser-local storage, the filesystem, or a remote service.

#### Scenario: Scratchpad reload

- **WHEN** scratchpad component is recreated
- **THEN** note editor starts empty rather than restoring previous note text

#### Scenario: Note entry

- **WHEN** user enters note text
- **THEN** text remains available in current editor and no browser-local storage entry is created

### Requirement: Copy notes to agent harness

The scratchpad MUST provide an explicit copy action that copies exact note text to the clipboard for pasting into the agent harness. Empty note text MUST leave copy action disabled, and clipboard failure MUST be reported without clearing note text.

#### Scenario: Copy note

- **WHEN** user enters note text and activates copy action
- **THEN** exact note text is copied and interface confirms it can be pasted into the agent harness

#### Scenario: Empty note

- **WHEN** scratchpad contains no non-whitespace text
- **THEN** copy action is disabled

#### Scenario: Clipboard failure

- **WHEN** clipboard copy fails
- **THEN** interface reports failure and retains note text for retry

### Requirement: Expose accessible note editing

The scratchpad MUST expose a logical heading, an accessible name for its textarea, visible focus treatment, and live copy status. Note text MUST remain plain textarea content and MUST NOT be interpreted as HTML.

#### Scenario: Keyboard note entry

- **WHEN** user reaches scratchpad with keyboard
- **THEN** note editor receives focus, exposes its accessible name, and accepts text without requiring pointer interaction
