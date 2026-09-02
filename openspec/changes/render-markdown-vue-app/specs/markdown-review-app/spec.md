## ADDED Requirements

### Requirement: Consume explicit response envelope

Browser application MUST read one embedded response envelope containing response, session, and entry identifiers plus source Markdown. It MUST show a visible error state when envelope is absent, malformed, or incomplete and MUST NOT read harness session files directly.

#### Scenario: Valid response loads

- **WHEN** application opens with complete embedded response envelope
- **THEN** application displays Markdown for that response and exposes matching response identity

#### Scenario: Envelope is invalid

- **WHEN** embedded response envelope is missing or does not contain required string fields
- **THEN** application displays actionable load failure instead of empty or stale response content

### Requirement: Render sanitized Markdown

Browser application MUST parse assistant text with a maintained Markdown parser, disable response-provided raw HTML, sanitize generated HTML with a maintained sanitizer before DOM insertion, and prevent response content from creating scripts, event handlers, unsafe URLs, or executable markup.

#### Scenario: Hostile HTML remains inert

- **WHEN** response contains script tags, raw HTML, inline handlers, or markup-breaking text
- **THEN** application renders safe Markdown without executing or inserting hostile content

#### Scenario: Unsafe link is supplied

- **WHEN** Markdown link destination uses an executable or unsupported protocol
- **THEN** application omits unsafe navigation target

### Requirement: Render readable Markdown structures

Browser application MUST style headings, paragraphs, lists, tables, blockquotes, links, inline code, and fenced code with document-first hierarchy. Fenced code MUST use local syntax highlighting for supported languages and safe plaintext fallback for unsupported languages.

#### Scenario: Rich Markdown response renders

- **WHEN** response contains standard Markdown structures and supported fenced code
- **THEN** structures remain visually distinct and code is syntax highlighted without remote requests

#### Scenario: Unknown code language renders

- **WHEN** fenced code declares an unsupported language
- **THEN** code remains readable as escaped plaintext and render does not fail

### Requirement: Prevent response-triggered image requests

Browser application MUST NOT load image destinations supplied by assistant Markdown and MUST render image syntax as inert descriptive content.

#### Scenario: Remote image is supplied

- **WHEN** response contains Markdown image with remote source
- **THEN** browser makes no image request and displays inert image label or placeholder

### Requirement: Provide accessible responsive review shell

Browser application MUST provide semantic landmarks, logical heading order, keyboard-reachable copy and theme controls, visible focus, announced action status, reduced-motion-safe behavior, readable line lengths, horizontally scrollable code and tables, and no page-level horizontal clipping at narrow widths.

#### Scenario: Keyboard review actions

- **WHEN** user navigates shell by keyboard
- **THEN** controls receive visible focus and expose accessible names and status

#### Scenario: Narrow viewport

- **WHEN** application width is 375 CSS pixels
- **THEN** response and actions remain available without page-level horizontal scrolling

### Requirement: Remain local at runtime

Browser application MUST load its scripts, styles, fonts, icons, themes, and grammars from packaged local assets and MUST NOT require telemetry, CDN assets, or network startup calls.

#### Scenario: App opens offline

- **WHEN** generated response document opens with network unavailable
- **THEN** full review shell and Markdown rendering remain functional
