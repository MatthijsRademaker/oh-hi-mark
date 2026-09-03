## ADDED Requirements

### Requirement: Select latest active assistant response

The Pi `/ohm` command MUST inspect only the current session branch and MUST select the newest assistant message that contains one or more text content blocks. It MUST concatenate selected text blocks in source order and MUST ignore thinking blocks, tool calls, user messages, tool results, and assistant messages on abandoned branches.

#### Scenario: Latest assistant text is selected

- **WHEN** active branch contains multiple assistant messages with text
- **THEN** command uses text from newest qualifying assistant message only

#### Scenario: Tool-call-only assistant message is skipped

- **WHEN** newest assistant message contains tool calls but no text block
- **THEN** command selects newest earlier assistant message containing text

#### Scenario: No assistant text exists

- **WHEN** active branch contains no assistant message with text
- **THEN** command reports an actionable missing-response error and does not write or open an HTML file

### Requirement: Generate safe standalone HTML

The command MUST generate a complete standalone HTML document containing selected response text as literal text. It MUST escape HTML-significant characters before embedding response content, preserve line breaks, include the response identity formed from session ID and entry ID in document metadata, and include no response-controlled HTML, scripts, remote resources, or executable event handlers.

#### Scenario: HTML-significant response text is escaped

- **WHEN** response contains `<script>`, markup-looking text, quotes, ampersands, or apostrophes
- **THEN** generated source displays those characters as text and cannot execute or interpret them as HTML

#### Scenario: Formatting and identity are preserved

- **WHEN** response contains multiple lines and selected entry has session and entry identifiers
- **THEN** generated document preserves line breaks, remains readable without horizontal clipping, and exposes stable combined response identity in metadata

### Requirement: Write and open latest response document

The command MUST write generated HTML beneath a private directory inside the operating system temporary directory, use a safe deterministic filename for response identity, open the written absolute path through its argument-based platform browser helper, and notify the user with the path after successful generation. Repeated invocations for the same response MUST reuse its output path.

#### Scenario: Response document is opened

- **WHEN** response extraction and file writing succeed
- **THEN** command invokes platform browser helper with generated absolute file path and reports that path to user

#### Scenario: Same response is rendered repeatedly

- **WHEN** `/ohm` runs more than once for same session entry
- **THEN** command writes same response-specific path rather than creating unbounded duplicate files

#### Scenario: File generation fails

- **WHEN** temporary directory creation or HTML write fails
- **THEN** command reports error context to user and does not claim browser review opened
