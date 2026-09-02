import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  getResponseHtmlPath,
  renderResponseHtml,
  RESPONSE_PAYLOAD_PLACEHOLDER,
  serializeResponseEnvelope,
  writeResponseHtml,
} from "./html.ts";
import { findLatestAssistantResponse } from "./response.ts";
import type { ResponseEntry } from "./response.ts";

const response = {
  responseId: "session-123:entry-456",
  sessionId: "session-123",
  entryId: "entry-456",
  text: "# Hello\n\n</script><script>alert('no')</script> & \u2028\u2029",
};

const appTemplate = `<!doctype html>
<html lang="en">
  <body>
    <script id="ohm-response" type="application/json">${RESPONSE_PAYLOAD_PLACEHOLDER}</script>
    <div id="app"></div>
    <script type="module" src="./assets/app.js"></script>
  </body>
</html>
`;

function messageEntry(
  id: string,
  role: string,
  content: unknown,
): ResponseEntry {
  return { type: "message", id, message: { role, content } };
}

async function createPackagedApp(parentDirectory: string): Promise<string> {
  const appDirectory = join(parentDirectory, "packaged-app");
  const assetDirectory = join(appDirectory, "assets");
  await mkdir(assetDirectory, { recursive: true });
  await writeFile(join(appDirectory, "index.html"), appTemplate, "utf8");
  await writeFile(
    join(assetDirectory, "app.js"),
    "console.log('OHM');",
    "utf8",
  );
  return appDirectory;
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

test("injects exact response envelope without breaking script boundary", () => {
  const html = renderResponseHtml(response, appTemplate);
  const payload = html.match(
    /<script id="ohm-response" type="application\/json">(.*?)<\/script>/s,
  )?.[1];

  assert.ok(payload);
  assert.deepEqual(JSON.parse(payload), response);
  assert.match(payload, /\\u003c\/script\\u003e/);
  assert.match(payload, /\\u0026/);
  assert.match(payload, /\\u2028\\u2029/);
  assert.doesNotMatch(html, /<script>alert\('no'\)<\/script>/);
  assert.doesNotMatch(html, /https?:\/\//i);
});

test("rejects missing or duplicate response placeholders", () => {
  assert.throws(
    () => renderResponseHtml(response, "<!doctype html>"),
    /missing __OHM_RESPONSE_PAYLOAD__/,
  );
  assert.throws(
    () =>
      renderResponseHtml(
        response,
        `${RESPONSE_PAYLOAD_PLACEHOLDER}${RESPONSE_PAYLOAD_PLACEHOLDER}`,
      ),
    /multiple __OHM_RESPONSE_PAYLOAD__/,
  );
});

test("serializes HTML-significant and separator characters safely", () => {
  const serialized = serializeResponseEnvelope(response);

  assert.doesNotMatch(serialized, /[<>&\u2028\u2029]/u);
  assert.deepEqual(JSON.parse(serialized), response);
});

test("writes deterministic private app entry and refreshes local assets", async () => {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), "ohm-test-"));

  try {
    const appDirectory = await createPackagedApp(temporaryDirectory);
    const runtimeDirectory = join(temporaryDirectory, "runtime");
    const firstPath = await writeResponseHtml(
      response,
      runtimeDirectory,
      appDirectory,
    );
    const staleAssetPath = join(dirname(firstPath), "assets", "stale.js");
    await writeFile(staleAssetPath, "stale", "utf8");
    const secondPath = await writeResponseHtml(
      response,
      runtimeDirectory,
      appDirectory,
    );

    assert.equal(firstPath, secondPath);
    await assert.rejects(readFile(staleAssetPath, "utf8"), /ENOENT/);
    assert.equal(firstPath, getResponseHtmlPath(response, runtimeDirectory));
    assert.equal(isAbsolute(firstPath), true);
    assert.equal(
      await readFile(firstPath, "utf8"),
      renderResponseHtml(response, appTemplate),
    );
    assert.equal(
      await readFile(join(dirname(firstPath), "assets", "app.js"), "utf8"),
      "console.log('OHM');",
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

test("reports missing packaged app with source path", async () => {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), "ohm-test-"));

  try {
    const missingDirectory = join(temporaryDirectory, "missing-app");
    await assert.rejects(
      writeResponseHtml(response, temporaryDirectory, missingDirectory),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.match(error.message, /Could not read packaged OHM app at/);
        assert.ok(error.message.includes(missingDirectory));
        return true;
      },
    );
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test("packaged Vue app contains response marker and local entry assets", async () => {
  const extensionDirectory = dirname(fileURLToPath(import.meta.url));
  const packagedIndex = await readFile(
    join(extensionDirectory, "generated", "index.html"),
    "utf8",
  );

  assert.match(packagedIndex, new RegExp(RESPONSE_PAYLOAD_PLACEHOLDER));
  assert.match(packagedIndex, /<script defer src="\.\/assets\//);
  assert.match(packagedIndex, /\.\/assets\//);
  assert.doesNotMatch(packagedIndex, /type="module"|crossorigin/i);
  assert.doesNotMatch(packagedIndex, /https?:\/\//i);
});
