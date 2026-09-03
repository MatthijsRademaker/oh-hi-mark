import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawn, execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const rootDirectory = fileURLToPath(new URL("..", import.meta.url));
const generatedDirectory = join(
  rootDirectory,
  ".pi",
  "extensions",
  "ohm",
  "generated",
);
const fixturePath = join(
  rootDirectory,
  "tests",
  "fixtures",
  "browser-response.json",
);
const responsePlaceholder = "__OHM_RESPONSE_PAYLOAD__";
const jsonScriptEscapes = {
  "&": "\\u0026",
  "<": "\\u003c",
  ">": "\\u003e",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

function fail(message) {
  throw new Error(`Browser smoke failed: ${message}`);
}

function expect(condition, message) {
  if (!condition) fail(message);
}

function parseJson(value, description) {
  try {
    return JSON.parse(value);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(`${description} is not valid JSON: ${message}`);
  }
}

async function waitFor(check, description, timeoutMs = 15_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const result = await check();
    if (result) return result;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  fail(`timed out waiting for ${description}`);
}

async function findBrowser() {
  const candidates = process.env.OHM_BROWSER_BIN
    ? [process.env.OHM_BROWSER_BIN]
    : ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"];
  for (const candidate of candidates) {
    try {
      const { stdout } = await execFileAsync("which", [candidate], {
        encoding: "utf8",
      });
      const path = stdout.trim();
      if (path) return path;
    } catch {
      // Try next browser candidate.
    }
  }
  fail("Chrome/Chromium executable not found; set OHM_BROWSER_BIN");
}

async function createFileProtocolEntry(directory) {
  const fixture = parseJson(
    await readFile(fixturePath, "utf8"),
    "browser fixture",
  );
  const generatedIndexPath = join(directory, "index.html");
  const template = await readFile(generatedIndexPath, "utf8");
  const serialized = JSON.stringify(fixture).replace(
    /[<>&\u2028\u2029]/g,
    (character) => jsonScriptEscapes[character],
  );
  const markerCount = template.split(responsePlaceholder).length - 1;
  expect(
    markerCount === 1,
    `expected one response marker, found ${markerCount}`,
  );

  const responseFileName = `response-${encodeURIComponent(fixture.responseId)}.html`;
  const responsePath = join(directory, responseFileName);
  await writeFile(
    responsePath,
    template.replace(responsePlaceholder, serialized),
    "utf8",
  );
  return { fixture, responsePath };
}

async function fetchJson(url) {
  const response = await fetch(url);
  expect(response.ok, `${url} returned HTTP ${response.status}`);
  return parseJson(await response.text(), url);
}

async function waitForDevToolsEndpoint(child) {
  let stderr = "";
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });

  const endpoint = await waitFor(() => {
    const match = stderr.match(
      /DevTools listening on (ws:\/\/127\.0\.0\.1:\d+\/[^\s]+)/,
    );
    return match?.[1];
  }, "Chrome DevTools endpoint");
  return endpoint;
}

async function findPageEndpoint(browserEndpoint) {
  let browserUrl;
  try {
    browserUrl = new URL(browserEndpoint);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(`Chrome returned invalid DevTools endpoint: ${message}`);
  }
  const pagesUrl = `http://${browserUrl.hostname}:${browserUrl.port}/json/list`;
  return waitFor(async () => {
    const pages = await fetchJson(pagesUrl);
    return pages.find(
      (page) => page.type === "page" && page.webSocketDebuggerUrl,
    )?.webSocketDebuggerUrl;
  }, "Chrome page endpoint");
}

class DevToolsClient {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.socket = undefined;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async connect() {
    if (typeof WebSocket !== "function") {
      fail("Node WebSocket client is unavailable");
    }
    this.socket = new WebSocket(this.endpoint);
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener(
        "error",
        () => reject(new Error("Chrome DevTools WebSocket failed")),
        { once: true },
      );
      this.socket.addEventListener("message", (event) => {
        const message = parseJson(
          String(event.data),
          "Chrome DevTools message",
        );
        if (message.id !== undefined) {
          const pending = this.pending.get(message.id);
          if (!pending) return;
          this.pending.delete(message.id);
          if (message.error) {
            pending.reject(new Error(message.error.message));
          } else {
            pending.resolve(message.result);
          }
          return;
        }

        const listeners = this.listeners.get(message.method) || [];
        for (const listener of listeners) listener(message.params);
      });
    });
  }

  send(method, params = {}) {
    if (!this.socket)
      return Promise.reject(new Error("DevTools client is not connected"));
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) || [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }

  waitForEvent(method, timeoutMs = 15_000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const listeners = this.listeners.get(method) || [];
        this.listeners.set(
          method,
          listeners.filter((listener) => listener !== onEvent),
        );
        reject(new Error(`timed out waiting for DevTools event ${method}`));
      }, timeoutMs);
      const onEvent = (params) => {
        clearTimeout(timeout);
        const listeners = this.listeners.get(method) || [];
        this.listeners.set(
          method,
          listeners.filter((listener) => listener !== onEvent),
        );
        resolve(params);
      };
      this.on(method, onEvent);
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      fail(
        `page evaluation threw: ${result.exceptionDetails.text || "unknown error"}`,
      );
    }
    return result.result?.value;
  }

  close() {
    this.socket?.close();
    this.socket = undefined;
  }
}

async function runBrowserSmoke() {
  const browser = await findBrowser();
  const temporaryDirectory = await mkdtemp(
    join(tmpdir(), "ohm-browser-smoke-"),
  );
  const appDirectory = join(temporaryDirectory, "app");
  const profileDirectory = join(temporaryDirectory, "chrome-profile");
  let browserProcess;
  let browserExited = false;
  let devTools;

  try {
    await cp(generatedDirectory, appDirectory, { recursive: true });
    const { fixture, responsePath } =
      await createFileProtocolEntry(appDirectory);
    const responseUrl = pathToFileURL(responsePath).href;

    browserProcess = spawn(
      browser,
      [
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-background-networking",
        "--disable-component-update",
        "--disable-default-apps",
        "--disable-extensions",
        "--no-first-run",
        "--no-default-browser-check",
        "--remote-debugging-address=127.0.0.1",
        "--remote-debugging-port=0",
        `--user-data-dir=${profileDirectory}`,
        "about:blank",
      ],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    browserProcess.once("error", (error) => {
      fail(`Chrome could not start: ${error.message}`);
    });
    browserProcess.once("exit", () => {
      browserExited = true;
    });
    const browserEndpoint = await waitForDevToolsEndpoint(browserProcess);
    const pageEndpoint = await findPageEndpoint(browserEndpoint);
    devTools = new DevToolsClient(pageEndpoint);
    await devTools.connect();

    const failures = [];
    const externalRequests = [];
    const localRequests = [];
    const requestUrls = new Map();
    devTools.on("Runtime.exceptionThrown", (event) => {
      failures.push(
        `page exception: ${event.exceptionDetails?.text || "unknown"}`,
      );
    });
    devTools.on("Runtime.consoleAPICalled", (event) => {
      if (event.type === "error") failures.push("console.error");
    });
    devTools.on("Log.entryAdded", (event) => {
      if (event.entry?.level === "error")
        failures.push(`page log: ${event.entry.text}`);
    });
    devTools.on("Network.requestWillBeSent", (event) => {
      requestUrls.set(event.requestId, event.request.url);
      if (/^https?:/i.test(event.request.url)) {
        externalRequests.push(event.request.url);
      } else if (event.request.url.startsWith("file:")) {
        localRequests.push(event.request.url);
      }
    });
    devTools.on("Network.loadingFailed", (event) => {
      const url = requestUrls.get(event.requestId);
      if (url && /^https?:/i.test(url)) {
        failures.push(`blocked external request: ${url}`);
      }
    });

    await devTools.send("Runtime.enable");
    await devTools.send("Log.enable");
    await devTools.send("Network.enable");
    await devTools.send("Network.setCacheDisabled", { cacheDisabled: true });
    await devTools.send("Network.setBlockedURLs", {
      urls: ["http://*", "https://*"],
    });
    await devTools.send("Page.enable");
    await devTools.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await devTools.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });

    const loadEvent = devTools.waitForEvent("Page.loadEventFired");
    await devTools.send("Page.navigate", { url: responseUrl });
    await loadEvent;
    await waitFor(
      async () =>
        devTools.evaluate(
          "Boolean(document.querySelector('.ohm-markdown h1'))",
        ),
      "rendered Markdown heading",
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    await devTools.evaluate(
      "document.querySelector('button[aria-label=\\\"Copy response Markdown\\\"]')?.click()",
    );
    await new Promise((resolve) => setTimeout(resolve, 250));

    const inspection = await devTools.evaluate(`(() => {
      const article = document.querySelector('.ohm-markdown');
      const textarea = document.querySelector('#scratchpad-notes');
      const copyButton = document.querySelector('button[aria-label="Copy response Markdown"]');
      const themeButton = document.querySelector('button[aria-label^="Theme:"]');
      textarea?.focus();
      const activeElementId = document.activeElement?.id || '';
      const reducedMotionStyle = textarea ? getComputedStyle(textarea) : null;
      return {
        heading: document.querySelector('.ohm-markdown h1')?.textContent?.trim() || '',
        responseId: document.querySelector('.ohm-response-id')?.textContent?.trim() || '',
        articleHtml: article?.innerHTML || '',
        articleText: article?.textContent || '',
        imageCount: article?.querySelectorAll('img').length || 0,
        scriptCount: article?.querySelectorAll('script').length || 0,
        eventAttributeCount: article?.querySelectorAll('[onclick], [onerror], [onload]').length || 0,
        unsafeLinkCount: [...(article?.querySelectorAll('a') || [])]
          .filter((link) => /^javascript:/i.test(link.getAttribute('href') || '')).length,
        imagePlaceholder: article?.querySelector('.ohm-image-placeholder')?.textContent?.trim() || '',
        pageScrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        responseColumnWidth: document.querySelector('.ohm-response-column')?.getBoundingClientRect().width || 0,
        scratchpadWidth: document.querySelector('.ohm-scratchpad')?.getBoundingClientRect().width || 0,
        scratchpadOverflow: textarea ? getComputedStyle(textarea).overflowY : '',
        scratchpadResize: textarea ? getComputedStyle(textarea).resize : '',
        activeElementId,
        copyButtonDisabled: Boolean(copyButton?.disabled),
        copyButtonLabel: copyButton?.getAttribute('aria-label') || '',
        themeButtonLabel: themeButton?.getAttribute('aria-label') || '',
        reducedTransition: reducedMotionStyle?.transitionDuration || '',
        reducedAnimation: reducedMotionStyle?.animationDuration || '',
        hostileScriptRan: Boolean(window.__ohmHostileScript),
        copyStatus: document.querySelector('.sr-only[aria-live="polite"]')?.textContent?.trim() || '',
      };
    })()`);

    expect(
      inspection.heading === "Offline review",
      "offline response did not render",
    );
    expect(
      inspection.responseId === fixture.responseId,
      "response-specific identity did not render",
    );
    expect(
      inspection.articleHtml.includes("&lt;script&gt;") &&
        inspection.articleHtml.includes("&lt;div") &&
        !inspection.hostileScriptRan,
      "hostile HTML was not inert",
    );
    expect(
      inspection.imageCount === 0,
      "Markdown image created an active image element",
    );
    expect(
      inspection.imagePlaceholder.includes("Private image"),
      "inert image placeholder is missing",
    );
    expect(
      inspection.unsafeLinkCount === 0,
      "unsafe javascript link survived sanitization",
    );
    expect(
      inspection.scriptCount === 0,
      "response article contains a script element",
    );
    expect(
      inspection.eventAttributeCount === 0,
      "response article contains event attributes",
    );
    expect(
      externalRequests.length === 0,
      `response triggered network requests: ${externalRequests.join(", ")}`,
    );
    expect(
      localRequests.some((url) => /\/assets\/index-[^/]+\.js$/.test(url)),
      "local generated JavaScript asset was not requested",
    );
    expect(
      inspection.pageScrollWidth <= inspection.viewportWidth + 1,
      `narrow viewport clips horizontally: ${inspection.pageScrollWidth}px > ${inspection.viewportWidth}px`,
    );
    expect(
      inspection.responseColumnWidth > 0,
      "response column is hidden at narrow width",
    );
    expect(
      inspection.scratchpadWidth > 0,
      "scratchpad is hidden at narrow width",
    );
    expect(
      inspection.scratchpadOverflow === "auto",
      "scratchpad has no independent vertical scroll",
    );
    expect(
      inspection.scratchpadResize === "vertical",
      "scratchpad cannot be resized vertically",
    );
    expect(
      inspection.activeElementId === "scratchpad-notes",
      "keyboard focus cannot reach scratchpad",
    );
    expect(
      inspection.copyButtonLabel === "Copy response Markdown",
      "copy button has no accessible name",
    );
    expect(
      inspection.themeButtonLabel.startsWith("Theme:"),
      "theme control has no accessible name",
    );
    expect(
      !inspection.copyButtonDisabled,
      "copy response action is disabled with response loaded",
    );
    expect(
      inspection.reducedTransition !== "0.15s" &&
        inspection.reducedAnimation !== "0.8s",
      "reduced-motion preference was ignored",
    );
    expect(
      inspection.copyStatus.includes("copied") ||
        inspection.copyStatus.includes("Could not copy"),
      "copy action did not expose status",
    );
    expect(failures.length === 0, failures.join("; "));

    process.stdout.write(
      `Browser smoke passed: file://${responsePath}, ${localRequests.length} local requests, no external requests\n`,
    );
  } finally {
    devTools?.close();
    if (browserProcess && !browserExited) {
      await new Promise((resolve) => {
        const timeout = setTimeout(resolve, 2_000);
        browserProcess.once("exit", () => {
          clearTimeout(timeout);
          resolve();
        });
        browserProcess.kill("SIGTERM");
      });
    }
    await rm(temporaryDirectory, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 100,
    });
  }
}

try {
  await runBrowserSmoke();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
