## MODIFIED Requirements

### Requirement: Generate safe standalone HTML

Command MUST generate a complete response-specific HTML entry document for packaged local Vue application. It MUST embed selected response envelope as non-executable JSON, escape characters that can terminate or alter embedding element, preserve stable identity formed from session ID and entry ID, and include no response-controlled markup, scripts, attributes, or remote resources. Packaged application scripts MAY execute trusted local application code and MUST sanitize response-derived Markdown before DOM insertion.

#### Scenario: HTML-significant response text is embedded

- **WHEN** response contains script closing tags, markup-looking text, quotes, ampersands, Unicode separators, or apostrophes
- **THEN** generated source preserves exact response text in parsed envelope without allowing it to alter document structure or execute

#### Scenario: Formatting and identity are preserved

- **WHEN** response contains Markdown and selected entry has session and entry identifiers
- **THEN** generated application receives full Markdown plus stable combined response identity

### Requirement: Write and open latest response document

Command MUST write generated HTML beneath private directory inside operating system temporary directory, use safe deterministic filename for response identity, copy required packaged local application assets without following response-controlled paths, open written absolute path through argument-based platform browser helper, and notify user with path after successful generation. Repeated invocations for same response MUST reuse output path.

#### Scenario: Response application is opened

- **WHEN** response extraction, asset copy, and entry writing succeed
- **THEN** command invokes platform browser helper with generated absolute file path and reports that path to user

#### Scenario: Same response is rendered repeatedly

- **WHEN** `/ohm` runs more than once for same session entry
- **THEN** command writes same response-specific path and refreshes packaged assets rather than creating unbounded duplicate files

#### Scenario: App generation fails

- **WHEN** packaged application assets are missing or temporary asset copy or HTML write fails
- **THEN** command reports error context to user and does not claim browser review opened
