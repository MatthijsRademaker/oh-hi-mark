import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/**
 * Project-local `/ohm` entrypoint.
 *
 * This is deliberately a stub. Response extraction, transport, browser launch,
 * and scratchpad persistence belong to a later implementation change.
 */
export default function ohmExtension(pi: ExtensionAPI): void {
  pi.registerCommand("ohm", {
    description: "Open latest assistant response in OHM (scaffold only)",
    handler: async (_args, ctx) => {
      ctx.ui.notify(
        "OHM scaffold loaded; browser review bridge is not implemented yet.",
        "warning",
      );
    },
  });
}
