import bash from "@shikijs/langs/bash";
import css from "@shikijs/langs/css";
import diff from "@shikijs/langs/diff";
import go from "@shikijs/langs/go";
import html from "@shikijs/langs/html";
import javascript from "@shikijs/langs/javascript";
import json from "@shikijs/langs/json";
import jsx from "@shikijs/langs/jsx";
import markdown from "@shikijs/langs/markdown";
import python from "@shikijs/langs/python";
import rust from "@shikijs/langs/rust";
import sql from "@shikijs/langs/sql";
import tsx from "@shikijs/langs/tsx";
import typescript from "@shikijs/langs/typescript";
import vue from "@shikijs/langs/vue";
import yaml from "@shikijs/langs/yaml";
import { fromHighlighter } from "@shikijs/markdown-it/core";
import githubDarkDefault from "@shikijs/themes/github-dark-default";
import githubLightDefault from "@shikijs/themes/github-light-default";
import DOMPurify from "dompurify";
import MarkdownIt from "markdown-it";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import type { BundledLanguage } from "shiki";
import wasm from "shiki/wasm";

const supportedLanguages = [
  ...bash,
  ...css,
  ...diff,
  ...go,
  ...html,
  ...javascript,
  ...json,
  ...jsx,
  ...markdown,
  ...python,
  ...rust,
  ...sql,
  ...tsx,
  ...typescript,
  ...vue,
  ...yaml,
];

const plainTextLanguage = "text" as BundledLanguage;

async function createMarkdownParser() {
  const parser = new MarkdownIt({
    breaks: false,
    html: false,
    linkify: true,
    typographer: true,
  });

  parser.renderer.rules.link_open = (
    tokens,
    index,
    options,
    _environment,
    renderer,
  ) => {
    const token = tokens[index];
    if (token.attrGet("href")) {
      token.attrSet("target", "_blank");
      token.attrSet("rel", "noopener noreferrer");
    }
    return renderer.renderToken(tokens, index, options);
  };

  parser.renderer.rules.image = (tokens, index) => {
    const label = tokens[index].content.trim() || "Unlabeled image";
    return `<span class="ohm-image-placeholder" role="note">Image omitted: ${parser.utils.escapeHtml(label)}</span>`;
  };

  const highlighter = await createHighlighterCore({
    engine: createOnigurumaEngine(wasm),
    langs: supportedLanguages,
    themes: [githubLightDefault, githubDarkDefault],
  });

  parser.use(
    fromHighlighter(highlighter, {
      themes: {
        light: "github-light-default",
        dark: "github-dark-default",
      },
      defaultLanguage: plainTextLanguage,
      fallbackLanguage: plainTextLanguage,
    }),
  );

  return parser;
}

const parserPromise = createMarkdownParser();

export async function renderMarkdown(markdown: string): Promise<string> {
  const parser = await parserPromise;
  const rendered = parser.render(markdown);

  return DOMPurify.sanitize(rendered, {
    ADD_ATTR: ["target"],
    FORBID_ATTR: ["ping", "src", "srcset"],
    FORBID_TAGS: [
      "button",
      "embed",
      "form",
      "iframe",
      "img",
      "input",
      "link",
      "meta",
      "object",
      "select",
      "style",
      "textarea",
    ],
    USE_PROFILES: { html: true },
  });
}
