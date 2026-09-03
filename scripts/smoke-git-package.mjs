import { cp, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { runInstalledPackageSmoke } from "./package-install-smoke.mjs";

const execFileAsync = promisify(execFile);
const rootDirectory = fileURLToPath(new URL("..", import.meta.url));

function parseJson(value, description) {
  try {
    return JSON.parse(value);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${description} is not valid JSON: ${message}`);
  }
}

async function createWorkingTreeSnapshot(destination) {
  await mkdir(destination, { recursive: true });
  const { stdout } = await execFileAsync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: rootDirectory, encoding: "utf8" },
  );
  for (const relativePath of stdout.split("\0").filter(Boolean)) {
    const sourcePath = join(rootDirectory, relativePath);
    const destinationPath = join(destination, relativePath);
    await mkdir(dirname(destinationPath), { recursive: true });
    await cp(sourcePath, destinationPath, { recursive: true });
  }

  await execFileAsync("git", ["init", "--quiet"], { cwd: destination });
  await execFileAsync("git", ["config", "user.name", "OHM release smoke"], {
    cwd: destination,
  });
  await execFileAsync(
    "git",
    ["config", "user.email", "release-smoke@localhost"],
    { cwd: destination },
  );
  await execFileAsync("git", ["add", "--all"], { cwd: destination });
  await execFileAsync(
    "git",
    ["commit", "--quiet", "-m", "release smoke snapshot"],
    {
      cwd: destination,
    },
  );
}

const temporaryDirectory = await mkdtemp(join(tmpdir(), "ohm-git-smoke-"));
try {
  const { stdout: status } = await execFileAsync(
    "git",
    ["status", "--porcelain=v1"],
    { cwd: rootDirectory, encoding: "utf8" },
  );
  const sourceDirectory = join(temporaryDirectory, "source");
  const checkoutDirectory = join(temporaryDirectory, "checkout");
  const sourceMode = status.trim()
    ? "working-tree snapshot"
    : "committed checkout";

  if (status.trim()) {
    await createWorkingTreeSnapshot(sourceDirectory);
  } else {
    await execFileAsync(
      "git",
      [
        "clone",
        "--quiet",
        "--local",
        "--no-hardlinks",
        rootDirectory,
        sourceDirectory,
      ],
      { cwd: temporaryDirectory },
    );
  }

  await execFileAsync(
    "git",
    [
      "clone",
      "--quiet",
      "--local",
      "--no-hardlinks",
      sourceDirectory,
      checkoutDirectory,
    ],
    { cwd: temporaryDirectory },
  );
  const manifest = parseJson(
    await readFile(join(checkoutDirectory, "package.json"), "utf8"),
    "Git checkout package manifest",
  );
  if (manifest.pi?.extensions?.length !== 1) {
    throw new Error(
      "Git checkout root manifest does not expose one Pi extension",
    );
  }

  await runInstalledPackageSmoke(checkoutDirectory, "Git-source");
  process.stdout.write(`Git-source smoke used clean ${sourceMode}.\n`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
