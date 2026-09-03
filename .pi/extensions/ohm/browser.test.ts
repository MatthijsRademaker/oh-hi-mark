import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import type { ChildProcess, SpawnOptions } from "node:child_process";
import test from "node:test";

import {
  getBrowserCommand,
  openBrowser,
  type BrowserSpawner,
} from "./browser.ts";

function fakeChild(): ChildProcess & EventEmitter {
  const child = new EventEmitter() as ChildProcess & EventEmitter;
  child.unref = () => child;
  return child;
}

test("uses argument-based platform browser launchers", () => {
  const target = "/tmp/ohm response.html";

  assert.deepEqual(getBrowserCommand(target, "darwin"), ["open", [target]]);
  assert.deepEqual(getBrowserCommand(target, "win32"), [
    "rundll32",
    ["url.dll,FileProtocolHandler", target],
  ]);
  assert.deepEqual(getBrowserCommand(target, "linux"), ["xdg-open", [target]]);
});

test("launches browser without a shell and reports spawn options", async () => {
  const child = fakeChild();
  let invocation:
    | { command: string; args: string[]; options: SpawnOptions }
    | undefined;
  let unrefCalled = false;
  child.unref = () => {
    unrefCalled = true;
    return child;
  };

  const spawnProcess: BrowserSpawner = (command, args, options) => {
    invocation = { command, args, options };
    queueMicrotask(() => child.emit("spawn"));
    return child;
  };

  await openBrowser("/tmp/review.html", spawnProcess, "linux");

  assert.deepEqual(invocation, {
    command: "xdg-open",
    args: ["/tmp/review.html"],
    options: { detached: true, stdio: "ignore" },
  });
  assert.equal(unrefCalled, true);
});

test("rejects with launcher context when browser spawn fails", async () => {
  const spawnProcess: BrowserSpawner = (_command, _args, _options) => {
    const child = fakeChild();
    queueMicrotask(() => child.emit("error", new Error("browser unavailable")));
    return child;
  };

  await assert.rejects(
    openBrowser("/tmp/review.html", spawnProcess, "linux"),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.equal(
        error.message,
        "Could not launch xdg-open: browser unavailable",
      );
      return true;
    },
  );
});
