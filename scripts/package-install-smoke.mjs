import {
  access,
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { spawn, execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { delimiter, dirname, join, relative, sep } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function fail(message) {
  throw new Error(`Installed package smoke failed: ${message}`);
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function getSmokeBrowserLauncher() {
  if (process.platform === "darwin") return "open";
  if (process.platform === "win32") return "rundll32";
  return "xdg-open";
}

function getSmokeBrowserLauncherScript() {
  if (process.platform === "win32") {
    return '@echo off\r\necho %2>"%OHM_SMOKE_LAUNCH_LOG%"\r\n';
  }
  return '#!/bin/sh\nprintf "%s" "$1" > "$OHM_SMOKE_LAUNCH_LOG"\n';
}

async function waitForFile(path, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await pathExists(path)) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  fail(`timed out waiting for ${path}`);
}

function createSessionFixture(sessionPath, cwd) {
  const timestamp = new Date().toISOString();
  const session = {
    type: "session",
    version: 3,
    id: "ohm-package-smoke",
    timestamp,
    cwd,
  };
  const userEntry = {
    type: "message",
    id: "11111111",
    parentId: null,
    timestamp,
    message: {
      role: "user",
      content: "Open review surface",
      timestamp: Date.now(),
    },
  };
  const assistantEntry = {
    type: "message",
    id: "22222222",
    parentId: "11111111",
    timestamp,
    message: {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "# Installed package smoke\n\nGenerated assets loaded.",
        },
      ],
      api: "smoke",
      provider: "smoke",
      model: "smoke",
      usage: {
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0,
        totalTokens: 0,
        cost: {
          input: 0,
          output: 0,
          cacheRead: 0,
          cacheWrite: 0,
          total: 0,
        },
      },
      stopReason: "stop",
      timestamp: Date.now(),
    },
  };

  return writeFile(
    sessionPath,
    `${[session, userEntry, assistantEntry]
      .map((entry) => JSON.stringify(entry))
      .join("\n")}\n`,
    "utf8",
  );
}

async function runPiCommand(
  projectDirectory,
  sessionPath,
  environment,
  launcherLog,
) {
  const piCommand = process.env.PI_CLI || "pi";
  const child = spawn(
    piCommand,
    [
      "--mode",
      "rpc",
      "--session",
      sessionPath,
      "--no-context-files",
      "--offline",
      "--approve",
    ],
    {
      cwd: projectDirectory,
      env: environment,
      stdio: ["pipe", "pipe", "pipe"],
    },
  );
  const output = [];
  let buffer = "";
  let exitCode;

  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    buffer += chunk;
    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex !== -1) {
      const line = buffer.slice(0, newlineIndex).replace(/\r$/, "");
      buffer = buffer.slice(newlineIndex + 1);
      if (!line) {
        newlineIndex = buffer.indexOf("\n");
        continue;
      }
      try {
        output.push(JSON.parse(line));
      } catch {
        output.push({ type: "invalid_output", line });
      }
      newlineIndex = buffer.indexOf("\n");
    }
  });
  child.stderr.on("data", (chunk) => {
    output.push({ type: "stderr", text: chunk });
  });
  child.once("exit", (code) => {
    exitCode = code;
  });

  const response = new Promise((resolve, reject) => {
    let interval;
    const finish = () => {
      if (interval) clearInterval(interval);
      clearTimeout(timeout);
    };
    const timeout = setTimeout(() => {
      finish();
      reject(
        new Error(
          `timed out waiting for /ohm RPC response; output: ${JSON.stringify(output)}`,
        ),
      );
    }, 20_000);

    const checkOutput = () => {
      const match = output.find(
        (entry) => entry.id === "ohm" && entry.type === "response",
      );
      if (!match) return;
      finish();
      resolve(match);
    };

    interval = setInterval(checkOutput, 25);
    child.once("error", (error) => {
      finish();
      reject(error);
    });
    child.once("exit", () => {
      if (
        !output.some((entry) => entry.id === "ohm" && entry.type === "response")
      ) {
        finish();
        reject(
          new Error(
            `Pi exited before /ohm RPC response (code ${exitCode ?? "unknown"}); output: ${JSON.stringify(output)}`,
          ),
        );
      }
    });
  });

  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    child.stdin.write(
      `${JSON.stringify({ id: "ohm", type: "prompt", message: "/ohm" })}\n`,
    );
    const rpcResponse = await response;
    if (!rpcResponse.success)
      fail(`Pi rejected /ohm: ${JSON.stringify(rpcResponse)}`);

    await waitForFile(launcherLog, 5_000);
  } finally {
    if (exitCode === undefined) child.kill("SIGTERM");
    await new Promise((resolve) => {
      if (exitCode !== undefined) {
        resolve();
        return;
      }
      child.once("exit", resolve);
      setTimeout(resolve, 2_000);
    });
  }
}

export async function runInstalledPackageSmoke(packageDirectory, label) {
  const temporaryDirectory = await mkdtemp(
    join(tmpdir(), "ohm-install-smoke-"),
  );
  const projectDirectory = join(temporaryDirectory, "project");
  const piHome = join(temporaryDirectory, "pi-home");
  const runtimeDirectory = join(temporaryDirectory, "runtime");
  const launcherDirectory = join(temporaryDirectory, "bin");
  const launcherLog = join(temporaryDirectory, "browser-launch.txt");
  const launcherPath = join(
    launcherDirectory,
    getSmokeBrowserLauncher(),
  );
  const sessionPath = join(projectDirectory, "session.jsonl");

  try {
    await Promise.all([
      mkdir(projectDirectory, { recursive: true }),
      mkdir(piHome, { recursive: true }),
      mkdir(runtimeDirectory, { recursive: true }),
      mkdir(launcherDirectory, { recursive: true }),
    ]);
    await writeFile(launcherPath, getSmokeBrowserLauncherScript(), "utf8");
    await chmod(launcherPath, 0o755);
    await createSessionFixture(sessionPath, projectDirectory);

    await execFileAsync(
      "npm",
      [
        "install",
        "--omit=dev",
        "--ignore-scripts",
        "--legacy-peer-deps",
        "--no-package-lock",
      ],
      { cwd: packageDirectory, encoding: "utf8" },
    );
    await execFileAsync(
      process.env.PI_CLI || "pi",
      ["install", packageDirectory, "-l", "--approve"],
      {
        cwd: projectDirectory,
        env: {
          ...process.env,
          PI_CODING_AGENT_DIR: piHome,
          PI_OFFLINE: "1",
        },
        encoding: "utf8",
      },
    );

    const environment = {
      ...process.env,
      PATH: `${launcherDirectory}${delimiter}${process.env.PATH || ""}`,
      TMPDIR: runtimeDirectory,
      PI_CODING_AGENT_DIR: piHome,
      PI_OFFLINE: "1",
      OHM_SMOKE_LAUNCH_LOG: launcherLog,
    };
    await runPiCommand(projectDirectory, sessionPath, environment, launcherLog);

    const launcherOutput = await readFile(launcherLog, "utf8");
    const outputPath = launcherOutput.trim();
    const expectedRuntimePrefix = `${join(runtimeDirectory, "ohm")}${sep}`;
    if (!outputPath.startsWith(expectedRuntimePrefix)) {
      fail(
        `browser received path outside private runtime directory: ${outputPath}`,
      );
    }
    if (!(await pathExists(outputPath)))
      fail(`browser target does not exist: ${outputPath}`);

    const outputHtml = await readFile(outputPath, "utf8");
    if (!outputHtml.includes("ohm-package-smoke:22222222")) {
      fail("browser target does not contain response-specific identity");
    }
    const outputAssets = join(dirname(outputPath), "assets");
    if (!(await pathExists(outputAssets)))
      fail("copied generated assets are missing");
    if (
      outputPath.includes(`${sep}web${sep}`) ||
      outputHtml.includes("web/node_modules")
    ) {
      fail("runtime resolved source web workspace");
    }

    const outputStats = await stat(outputPath);
    if (process.platform !== "win32" && (outputStats.mode & 0o777) !== 0o600) {
      fail(
        `response file mode is ${(outputStats.mode & 0o777).toString(8)}, expected 600`,
      );
    }
    process.stdout.write(
      `Installed ${label} package smoke passed: ${relative(temporaryDirectory, outputPath)}\n`,
    );
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}
