import { access, readdir, readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join, relative, resolve } from "node:path";

const rootDirectory = fileURLToPath(new URL("..", import.meta.url));
const generatedDirectory = join(
  rootDirectory,
  ".pi",
  "extensions",
  "ohm",
  "generated",
);
const indexPath = join(generatedDirectory, "index.html");
const placeholder = "__OHM_RESPONSE_PAYLOAD__";

function fail(message) {
  console.error(`Generated output check failed: ${message}`);
  process.exitCode = 1;
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(directory) {
  const files = [];
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
  return files;
}

if (!(await pathExists(indexPath))) {
  fail(`missing ${relative(rootDirectory, indexPath)}`);
  process.exit(1);
}

const indexHtml = await readFile(indexPath, "utf8");
const placeholderCount = indexHtml.split(placeholder).length - 1;
if (placeholderCount !== 1) {
  fail(`expected one ${placeholder} marker, found ${placeholderCount}`);
}

const scriptTags = [...indexHtml.matchAll(/<script\b[^>]*>/gi)].map(
  (match) => match[0],
);
const entryScripts = scriptTags.filter((tag) => /\bsrc\s*=/i.test(tag));
if (entryScripts.length !== 1) {
  fail(`expected one generated script entry, found ${entryScripts.length}`);
}
for (const tag of entryScripts) {
  if (!/\bdefer(?:\s|=|>)/i.test(tag)) {
    fail(`generated script is not deferred: ${tag}`);
  }
  if (/\btype\s*=\s*["']module["']/i.test(tag)) {
    fail(`generated script is still an ES module: ${tag}`);
  }
}

if (/modulepreload|\bcrossorigin\b|\bintegrity\s*=/i.test(indexHtml)) {
  fail(
    "generated entry contains module preload or cross-origin runtime attributes",
  );
}

const resourceReferences = [
  ...indexHtml.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi),
].map((match) => match[1]);
for (const reference of resourceReferences) {
  if (reference.startsWith("#")) continue;
  if (!reference.startsWith("./assets/") || reference.includes("..")) {
    fail(`non-local generated resource reference: ${reference}`);
    continue;
  }

  const assetPath = resolve(generatedDirectory, reference);
  const relativeAssetPath = relative(generatedDirectory, assetPath);
  if (
    relativeAssetPath.startsWith("..") ||
    resolve(generatedDirectory, relativeAssetPath) !== assetPath
  ) {
    fail(`generated resource escapes asset directory: ${reference}`);
    continue;
  }
  if (!(await pathExists(assetPath))) {
    fail(`generated resource is missing: ${reference}`);
  }
}

if (/(?:src|href)\s*=\s*["'](?:https?:|\/\/|\/)/i.test(indexHtml)) {
  fail("generated entry contains an external or root-relative resource");
}

const runtimeCallPatterns = [
  /\bfetch\s*\(/,
  /\bnew\s+XMLHttpRequest\b/,
  /\bnew\s+WebSocket\b/,
  /\bnew\s+EventSource\b/,
];
const generatedFiles = await listFiles(generatedDirectory);
for (const generatedFile of generatedFiles) {
  if (!/\.(?:html|css|js|mjs|cjs)$/i.test(generatedFile)) continue;
  const contents = await readFile(generatedFile, "utf8");
  for (const pattern of runtimeCallPatterns) {
    if (pattern.test(contents)) {
      fail(
        `generated runtime contains network API ${pattern}: ${relative(rootDirectory, generatedFile)}`,
      );
    }
  }
}

const assetDirectory = join(generatedDirectory, "assets");
if (!(await pathExists(assetDirectory))) {
  fail("generated assets directory is missing");
} else if ((await readdir(assetDirectory)).length === 0) {
  fail("generated assets directory is empty");
}

if (process.exitCode) process.exit(1);
process.stdout.write(
  `Generated output valid: ${generatedFiles.length} files, entry ${pathToFileURL(indexPath).pathname}\n`,
);
