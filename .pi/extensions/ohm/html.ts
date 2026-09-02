import {
  chmod,
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { LatestAssistantResponse } from "./response.ts";

export const RESPONSE_PAYLOAD_PLACEHOLDER = "__OHM_RESPONSE_PAYLOAD__";

const PACKAGED_APP_DIRECTORY = fileURLToPath(
  new URL("./generated", import.meta.url),
);
const JSON_SCRIPT_ESCAPES: Record<string, string> = {
  "&": "\\u0026",
  "<": "\\u003c",
  ">": "\\u003e",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

function safeFilePart(value: string): string {
  const filePart = encodeURIComponent(value);
  return filePart || "response";
}

export function serializeResponseEnvelope(
  response: LatestAssistantResponse,
): string {
  return JSON.stringify(response).replace(
    /[<>&\u2028\u2029]/g,
    (character) => JSON_SCRIPT_ESCAPES[character],
  );
}

export function renderResponseHtml(
  response: LatestAssistantResponse,
  appTemplate: string,
): string {
  const placeholderIndex = appTemplate.indexOf(RESPONSE_PAYLOAD_PLACEHOLDER);
  if (placeholderIndex === -1) {
    throw new Error(
      `Packaged OHM app template is missing ${RESPONSE_PAYLOAD_PLACEHOLDER}.`,
    );
  }

  if (
    appTemplate.indexOf(
      RESPONSE_PAYLOAD_PLACEHOLDER,
      placeholderIndex + RESPONSE_PAYLOAD_PLACEHOLDER.length,
    ) !== -1
  ) {
    throw new Error(
      `Packaged OHM app template contains multiple ${RESPONSE_PAYLOAD_PLACEHOLDER} markers.`,
    );
  }

  return appTemplate.replace(
    RESPONSE_PAYLOAD_PLACEHOLDER,
    serializeResponseEnvelope(response),
  );
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

async function copyPackagedAssets(
  appDirectory: string,
  outputDirectory: string,
): Promise<void> {
  const entries = await readdir(appDirectory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "index.html") continue;

    const targetPath = join(outputDirectory, entry.name);
    await rm(targetPath, { recursive: true, force: true });
    await cp(join(appDirectory, entry.name), targetPath, {
      recursive: true,
      force: true,
    });
  }
}

export async function writeResponseHtml(
  response: LatestAssistantResponse,
  temporaryDirectory = tmpdir(),
  appDirectory = PACKAGED_APP_DIRECTORY,
): Promise<string> {
  const outputPath = getResponseHtmlPath(response, temporaryDirectory);
  const outputDirectory = dirname(outputPath);
  const templatePath = join(appDirectory, "index.html");

  let appTemplate: string;
  try {
    appTemplate = await readFile(templatePath, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Could not read packaged OHM app at ${templatePath}: ${message}`,
    );
  }

  await mkdir(outputDirectory, { recursive: true, mode: 0o700 });
  await chmod(outputDirectory, 0o700);
  await copyPackagedAssets(appDirectory, outputDirectory);
  await writeFile(outputPath, renderResponseHtml(response, appTemplate), {
    encoding: "utf8",
    mode: 0o600,
  });
  await chmod(outputPath, 0o600);

  return outputPath;
}
