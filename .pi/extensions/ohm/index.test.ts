import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join } from "node:path";
import test from "node:test";

import {
  escapeHtml,
  getResponseHtmlPath,
  renderResponseHtml,
  writeResponseHtml,
} from "./html.ts";
import { findLatestAssistantResponse } from "./response.ts";
import type { ResponseEntry } from "./response.ts";

const response = {
  responseId: "session-123:entry-456",
  sessionId: "session-123",
  entryId: "entry-456",
  text: "Hello\n\n<em>not markup</em> & \"quoted\" 'text'",
};

function messageEntry(
  id: string,
  role: string,
  content: unknown,
): ResponseEntry {
  return { type: "message", id, message: { role, content } };
}

test("finds newest assistant text on active branch", () => {
  const result = findLatestAssistantResponse(
    [
      messageEntry("old", "assistant", [{ type: "text", text: "old" }]),
      messageEntry("user", "user", "new prompt"),
      messageEntry("tools", "assistant", [{ type: "toolCall", name: "read" }]),
      messageEntry("new", "assistant", [
        { type: "thinking", thinking: "private thought" },
        { type: "text", text: "new part one" },
        { type: "text", text: "new part two" },
      ]),
    ],
    "session-123",
  );

  assert.deepEqual(result, {
    responseId: "session-123:new",
    sessionId: "session-123",
    entryId: "new",
    text: "new part one\nnew part two",
  });
});

test("skips assistant messages without text blocks", () => {
  const result = findLatestAssistantResponse(
    [
      messageEntry("answer", "assistant", [{ type: "text", text: "answer" }]),
      messageEntry("tools", "assistant", [
        { type: "thinking", thinking: "private thought" },
        { type: "toolCall", name: "bash" },
      ]),
    ],
    "session-123",
  );

  assert.equal(result?.entryId, "answer");
  assert.equal(result?.text, "answer");
});

test("returns no response when branch has no assistant text", () => {
  const result = findLatestAssistantResponse(
    [messageEntry("user", "user", "prompt")],
    "session-123",
  );

  assert.equal(result, undefined);
});

test("escapes response text and renders standalone document", () => {
  const html = renderResponseHtml(response);

  assert.match(html, /^<!doctype html>/i);
  assert.match(
    html,
    /<meta name="ohm-response-id" content="session-123:entry-456">/,
  );
  assert.match(
    html,
    /Hello\n\n&lt;em&gt;not markup&lt;\/em&gt; &amp; &quot;quoted&quot; &#39;text&#39;/,
  );
  assert.match(html, /white-space: pre-wrap/);
  assert.match(html, /overflow-wrap: anywhere/);
  assert.doesNotMatch(html, /<script\b/i);
  assert.doesNotMatch(html, /https?:\/\//i);
});

test("uses deterministic response-specific path and private file modes", async () => {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), "ohm-test-"));

  try {
    const firstPath = await writeResponseHtml(response, temporaryDirectory);
    const secondPath = await writeResponseHtml(response, temporaryDirectory);

    assert.equal(firstPath, secondPath);
    assert.equal(firstPath, getResponseHtmlPath(response, temporaryDirectory));
    assert.equal(isAbsolute(firstPath), true);
    assert.equal(
      await readFile(firstPath, "utf8"),
      renderResponseHtml(response),
    );

    if (process.platform !== "win32") {
      const directoryMode = (await stat(dirname(firstPath))).mode & 0o777;
      const fileMode = (await stat(firstPath)).mode & 0o777;
      assert.equal(directoryMode, 0o700);
      assert.equal(fileMode, 0o600);
    }
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test("escapes standalone values", () => {
  assert.equal(
    escapeHtml(`<script>alert("x")</script> & 'quoted'`),
    "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;quoted&#39;",
  );
});
