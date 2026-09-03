import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { runInstalledPackageSmoke } from "./package-install-smoke.mjs";

const execFileAsync = promisify(execFile);
const rootDirectory = new URL("..", import.meta.url);
const rootPath = decodeURIComponent(rootDirectory.pathname);

function fail(message) {
  throw new Error(`npm package smoke setup failed: ${message}`);
}

const temporaryDirectory = await mkdtemp(join(tmpdir(), "ohm-npm-smoke-"));
try {
  const archiveDirectory = join(temporaryDirectory, "archive");
  const extractDirectory = join(temporaryDirectory, "extract");
  await Promise.all([mkdir(archiveDirectory), mkdir(extractDirectory)]);

  const { stdout } = await execFileAsync(
    "npm",
    [
      "pack",
      "--json",
      "--ignore-scripts",
      "--pack-destination",
      archiveDirectory,
    ],
    { cwd: rootPath, encoding: "utf8" },
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

  const archivePath = join(archiveDirectory, records[0].filename);
  await execFileAsync("tar", ["-xzf", archivePath, "-C", extractDirectory]);
  const packageDirectory = join(extractDirectory, "package");
  await readFile(join(packageDirectory, "package.json"), "utf8");
  await runInstalledPackageSmoke(packageDirectory, "npm");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
