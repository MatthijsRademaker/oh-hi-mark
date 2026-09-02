import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import type { Plugin } from "vite";

function fileProtocolAssets(): Plugin {
  return {
    name: "ohm-file-protocol-assets",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        return html
          .replaceAll('<script type="module" crossorigin', "<script defer")
          .replaceAll(
            '<link rel="stylesheet" crossorigin',
            '<link rel="stylesheet"',
          );
      },
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [vue(), tailwindcss(), fileProtocolAssets()],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  build: {
    outDir: "../.pi/extensions/ohm/generated",
    emptyOutDir: true,
    modulePreload: false,
    rolldownOptions: {
      output: {
        format: "iife",
      },
    },
  },
});
