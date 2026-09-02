import { chmod, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import type { LatestAssistantResponse } from "./response.ts";

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

function safeFilePart(value: string): string {
  const filePart = encodeURIComponent(value);
  return filePart || "response";
}

export function renderResponseHtml(response: LatestAssistantResponse): string {
  const responseId = escapeHtml(response.responseId);
  const responseText = escapeHtml(response.text);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="ohm-response-id" content="${responseId}">
    <title>OHM · Assistant response</title>
    <style>
      :root {
        color-scheme: light dark;
        font-family: ui-sans-serif, system-ui, sans-serif;
      }

      body {
        margin: 0;
        background: Canvas;
        color: CanvasText;
      }

      main {
        box-sizing: border-box;
        max-width: 72rem;
        margin: 0 auto;
        padding: clamp(1rem, 4vw, 3rem);
      }

      header {
        border-bottom: 1px solid color-mix(in srgb, CanvasText 20%, transparent);
        margin-bottom: 2rem;
        padding-bottom: 1rem;
      }

      h1 {
        margin: 0;
        font-size: clamp(1.5rem, 3vw, 2.25rem);
      }

      .eyebrow {
        margin: 0 0 0.5rem;
        color: GrayText;
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .response-id {
        margin: 0.75rem 0 0;
        color: GrayText;
        font-family: ui-monospace, SFMono-Regular, monospace;
        font-size: 0.75rem;
        overflow-wrap: anywhere;
      }

      pre {
        margin: 0;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        font: inherit;
        line-height: 1.65;
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <p class="eyebrow">OHM · latest response</p>
        <h1>Assistant response</h1>
        <p class="response-id">${responseId}</p>
      </header>
      <pre>${responseText}</pre>
    </main>
  </body>
</html>
`;
}

export function getResponseHtmlPath(
  response: LatestAssistantResponse,
  temporaryDirectory = tmpdir(),
): string {
  const outputDirectory = resolve(temporaryDirectory, "ohm");
  return join(
    outputDirectory,
    `response-${safeFilePart(response.responseId)}.html`,
  );
}

export async function writeResponseHtml(
  response: LatestAssistantResponse,
  temporaryDirectory = tmpdir(),
): Promise<string> {
  const outputDirectory = resolve(temporaryDirectory, "ohm");
  const outputPath = getResponseHtmlPath(response, temporaryDirectory);

  await mkdir(outputDirectory, { recursive: true, mode: 0o700 });
  await chmod(outputDirectory, 0o700);
  await writeFile(outputPath, renderResponseHtml(response), {
    encoding: "utf8",
    mode: 0o600,
  });
  await chmod(outputPath, 0o600);

  return outputPath;
}
