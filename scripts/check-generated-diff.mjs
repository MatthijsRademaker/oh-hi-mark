import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const generatedPath = ".pi/extensions/ohm/generated";

try {
  const { stdout } = await execFileAsync(
    "git",
    ["status", "--porcelain=v1", "--", generatedPath],
    { encoding: "utf8" },
  );
  const status = stdout.trim();
  if (status) {
    process.stderr.write(
      `Generated output is stale or uncommitted. Rebuild and commit ${generatedPath}:\n${status}\n`,
    );
    process.exit(1);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(
    `Could not inspect generated output status: ${message}\n`,
  );
  process.exit(1);
}

process.stdout.write(`Generated output matches committed ${generatedPath}.\n`);
