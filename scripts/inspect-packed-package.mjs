import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
} from "node:fs/promises";
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { join, relative, sep } from "node:path";

const execFileAsync = promisify(execFile);
const rootDirectory = fileURLToPath(new URL("..", import.meta.url));
const generatedRelativeDirectory = ".pi/extensions/ohm/generated";
const requiredFiles = [
  "package.json",
  "README.md",
  "LICENSE",
  ".pi/extensions/ohm/index.ts",
  ".pi/extensions/ohm/browser.ts",
  ".pi/extensions/ohm/html.ts",
  ".pi/extensions/ohm/response.ts",
  `${generatedRelativeDirectory}/index.html`,
];
const forbiddenPatterns = [
  /^web(?:\/|$)/,
  /^\.pi\/(?:settings\.json|package\.json|skills\/|prompts\/|rules\/)/,
  /^\.pi\/extensions\/ohm\/index\.test\.ts$/,
  /^(?:\.claude|plugins|openspec|designs|\.devagent|\.agents)(?:\/|$)/,
  /^(?:AGENTS|CLAUDE)\.md$/,
  /^(?:tests?|scripts)(?:\/|$)/,
];

function fail(message) {
  throw new Error(`Packed package check failed: ${message}`);
}

function parseJson(value, description) {
  try {
    return JSON.parse(value);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(`${description} is not valid JSON: ${message}`);
  }
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

async function packPackage(destination) {
  const { stdout } = await execFileAsync(
    "npm",
    ["pack", "--json", "--ignore-scripts", "--pack-destination", destination],
    { cwd: rootDirectory, encoding: "utf8" },
  );
  let records;
  try {
    records = JSON.parse(stdout);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(`npm pack returned invalid JSON: ${message}`);
  }
  if (!Array.isArray(records) || !records[0]?.filename) {
    fail("npm pack returned no archive");
  }
  return join(destination, records[0].filename);
}

const temporaryDirectory = await mkdtemp(
  join(tmpdir(), "ohm-package-inspect-"),
);
try {
  const archiveDirectory = join(temporaryDirectory, "archive");
  const extractDirectory = join(temporaryDirectory, "extract");
  await Promise.all([mkdir(archiveDirectory), mkdir(extractDirectory)]);
  const archivePath = await packPackage(archiveDirectory);
  await execFileAsync("tar", ["-xzf", archivePath, "-C", extractDirectory]);

  const packageDirectory = join(extractDirectory, "package");
  if (!(await pathExists(packageDirectory)))
    fail("archive has no package root");

  const packageFiles = (await listFiles(packageDirectory)).map((path) =>
    relative(packageDirectory, path).split(sep).join("/"),
  );
  const packageFileSet = new Set(packageFiles);
  for (const requiredFile of requiredFiles) {
    if (!packageFileSet.has(requiredFile)) {
      fail(`required file missing: ${requiredFile}`);
    }
  }

  for (const packageFile of packageFiles) {
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(packageFile))
        fail(`forbidden file present: ${packageFile}`);
    }
  }

  const packageManifest = parseJson(
    await readFile(join(packageDirectory, "package.json"), "utf8"),
    "packed package manifest",
  );
  if (packageManifest.private) fail("package is marked private");
  if (!packageManifest.name || !packageManifest.version) {
    fail("package name or version is empty");
  }
  if (!packageManifest.keywords?.includes("pi-package")) {
    fail("pi-package keyword is missing");
  }
  if (
    JSON.stringify(packageManifest.pi?.extensions) !==
    JSON.stringify(["./.pi/extensions/ohm/index.ts"])
  ) {
    fail("root Pi manifest does not expose exactly OHM entrypoint");
  }
  if (
    packageManifest.peerDependencies?.["@earendil-works/pi-coding-agent"] !==
    "*"
  ) {
    fail("Pi core peer dependency is not host-provided");
  }

  const generatedDirectory = join(packageDirectory, generatedRelativeDirectory);
  const generatedIndex = await readFile(
    join(generatedDirectory, "index.html"),
    "utf8",
  );
  const assetReferences = [
    ...generatedIndex.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi),
  ].map((match) => match[1]);
  for (const reference of assetReferences) {
    if (!reference.startsWith("./assets/") || reference.includes("..")) {
      fail(`generated entry has non-local reference: ${reference}`);
    }
    if (!(await pathExists(join(generatedDirectory, reference)))) {
      fail(`generated entry references missing asset: ${reference}`);
    }
  }

  const generatedFiles = packageFiles.filter(
    (path) =>
      path === generatedRelativeDirectory + "/index.html" ||
      path.startsWith(`${generatedRelativeDirectory}/assets/`),
  );
  if (generatedFiles.length < 2)
    fail("generated application tree is incomplete");

  const archiveStats = await stat(archivePath);
  process.stdout.write(
    `Packed package valid: ${packageManifest.name}@${packageManifest.version}, ${packageFiles.length} files, ${archiveStats.size} bytes\n`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
