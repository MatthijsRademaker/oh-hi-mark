import { spawn } from "node:child_process";

function getBrowserCommand(target: string): [string, string[]] {
  if (process.platform === "darwin") {
    return ["open", [target]];
  }

  if (process.platform === "win32") {
    return ["rundll32", ["url.dll,FileProtocolHandler", target]];
  }

  return ["xdg-open", [target]];
}

/** Open target using platform default handler without invoking a shell. */
export function openBrowser(target: string): Promise<void> {
  const [command, args] = getBrowserCommand(target);

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      detached: true,
      stdio: "ignore",
    });

    child.once("error", reject);
    child.once("spawn", () => {
      child.unref();
      resolve();
    });
  });
}
