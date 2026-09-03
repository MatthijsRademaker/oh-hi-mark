import {
  spawn,
  type ChildProcess,
  type SpawnOptions,
} from "node:child_process";

export type BrowserCommand = [command: string, args: string[]];
export type BrowserSpawner = (
  command: string,
  args: string[],
  options: SpawnOptions,
) => ChildProcess;

export function getBrowserCommand(
  target: string,
  platform: NodeJS.Platform = process.platform,
): BrowserCommand {
  if (platform === "darwin") {
    return ["open", [target]];
  }

  if (platform === "win32") {
    return ["rundll32", ["url.dll,FileProtocolHandler", target]];
  }

  return ["xdg-open", [target]];
}

/** Open target using platform default handler without invoking a shell. */
export function openBrowser(
  target: string,
  spawnProcess: BrowserSpawner = spawn,
  platform: NodeJS.Platform = process.platform,
): Promise<void> {
  const [command, args] = getBrowserCommand(target, platform);

  return new Promise((resolve, reject) => {
    const child = spawnProcess(command, args, {
      detached: true,
      stdio: "ignore",
    });

    child.once("error", (error) => {
      const message = error instanceof Error ? error.message : String(error);
      reject(
        new Error(`Could not launch ${command}: ${message}`, { cause: error }),
      );
    });
    child.once("spawn", () => {
      child.unref();
      resolve();
    });
  });
}
