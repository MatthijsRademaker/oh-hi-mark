import type {
  ExtensionAPI,
  ExtensionCommandContext,
} from "@earendil-works/pi-coding-agent";

import { openBrowser } from "./browser.ts";
import { writeResponseHtml } from "./html.ts";
import { findLatestAssistantResponse } from "./response.ts";

export default function ohmExtension(pi: ExtensionAPI): void {
  pi.registerCommand("ohm", {
    description: "Open latest assistant response in OHM review app",
    handler: async (_args: string, ctx: ExtensionCommandContext) => {
      await ctx.waitForIdle();

      const response = findLatestAssistantResponse(
        ctx.sessionManager.getBranch(),
        ctx.sessionManager.getSessionId(),
      );

      if (!response) {
        ctx.ui.notify(
          "OHM found no assistant response with text on active branch.",
          "warning",
        );
        return;
      }

      let outputPath: string;
      try {
        outputPath = await writeResponseHtml(response);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        ctx.ui.notify(
          `OHM could not prepare review app: ${errorMessage}`,
          "error",
        );
        return;
      }

      try {
        await openBrowser(outputPath);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        ctx.ui.notify(
          `OHM prepared review app at ${outputPath}, but browser launch failed: ${errorMessage}`,
          "warning",
        );
        return;
      }

      ctx.ui.notify(`OHM opened review app: ${outputPath}`, "info");
    },
  });
}
