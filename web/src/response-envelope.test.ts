import { describe, expect, it } from "vitest";

import {
  parseResponseEnvelope,
  readResponseEnvelope,
  RESPONSE_ENVELOPE_ELEMENT_ID,
  RESPONSE_ENVELOPE_PLACEHOLDER,
} from "@/response-envelope";

const envelope = {
  responseId: "session:entry",
  sessionId: "session",
  entryId: "entry",
  text: "# Safe Markdown",
};

function setEmbeddedPayload(payload: string): void {
  const element = document.createElement("script");
  element.id = RESPONSE_ENVELOPE_ELEMENT_ID;
  element.type = "application/json";
  element.textContent = payload;
  document.body.append(element);
}

describe("response envelope", () => {
  it("parses required string fields", () => {
    expect(parseResponseEnvelope(envelope)).toEqual(envelope);
  });

  it("rejects missing, invalid, and empty identity fields", () => {
    expect(() => parseResponseEnvelope(null)).toThrow("must be an object");
    expect(() => parseResponseEnvelope({ ...envelope, text: 42 })).toThrow(
      'field "text" must be a string',
    );
    expect(() => parseResponseEnvelope({ ...envelope, entryId: "" })).toThrow(
      "identity fields must not be empty",
    );
  });

  it("reads complete embedded JSON", () => {
    setEmbeddedPayload(JSON.stringify(envelope));
    expect(readResponseEnvelope(document, false)).toEqual(envelope);
  });

  it("fails visibly for missing, malformed, and unreplaced payloads", () => {
    expect(() => readResponseEnvelope(document, false)).toThrow("is missing");

    setEmbeddedPayload("{broken");
    expect(() => readResponseEnvelope(document, false)).toThrow("is invalid");

    document.body.innerHTML = "";
    setEmbeddedPayload(RESPONSE_ENVELOPE_PLACEHOLDER);
    expect(() => readResponseEnvelope(document, false)).toThrow(
      "placeholder was not replaced",
    );
  });
});
