export const RESPONSE_ENVELOPE_ELEMENT_ID = "ohm-response";
export const RESPONSE_ENVELOPE_PLACEHOLDER = "__OHM_RESPONSE_PAYLOAD__";

export interface ResponseEnvelope {
  responseId: string;
  sessionId: string;
  entryId: string;
  text: string;
}

const previewEnvelope: ResponseEnvelope = {
  responseId: "preview:assistant-response",
  sessionId: "preview",
  entryId: "assistant-response",
  text: `# Review answers, not terminal wrapping

OHM turns latest assistant response into focused reading surface.

## Markdown feels native

- Clear document hierarchy
- Safe links and inert image references
- Local syntax highlighting

> Assistant output stays untrusted. Markdown is parsed with raw HTML disabled, then sanitized before insertion.

\`\`\`ts
interface ResponseEnvelope {
  responseId: string
  text: string
}
\`\`\`
`,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseResponseEnvelope(value: unknown): ResponseEnvelope {
  if (!isRecord(value)) {
    throw new Error("Response envelope must be an object.");
  }

  const { responseId, sessionId, entryId, text } = value;
  const requiredFields = { responseId, sessionId, entryId, text };
  for (const [field, fieldValue] of Object.entries(requiredFields)) {
    if (typeof fieldValue !== "string") {
      throw new Error(`Response envelope field "${field}" must be a string.`);
    }
  }

  if (
    typeof responseId !== "string" ||
    typeof sessionId !== "string" ||
    typeof entryId !== "string" ||
    typeof text !== "string"
  ) {
    throw new Error("Response envelope contains invalid fields.");
  }

  if (!responseId || !sessionId || !entryId) {
    throw new Error("Response envelope identity fields must not be empty.");
  }

  return { responseId, sessionId, entryId, text };
}

export function readResponseEnvelope(
  sourceDocument: Document = document,
  allowPreview = import.meta.env.DEV,
): ResponseEnvelope {
  const element = sourceDocument.getElementById(RESPONSE_ENVELOPE_ELEMENT_ID);
  if (!element) {
    throw new Error("Embedded OHM response envelope is missing.");
  }

  const payload = element.textContent?.trim();
  if (!payload) {
    throw new Error("Embedded OHM response envelope is empty.");
  }

  if (payload === RESPONSE_ENVELOPE_PLACEHOLDER) {
    if (allowPreview) {
      return previewEnvelope;
    }
    throw new Error(
      "OHM response placeholder was not replaced during handoff.",
    );
  }

  try {
    return parseResponseEnvelope(JSON.parse(payload));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Embedded OHM response envelope is invalid: ${message}`);
  }
}
