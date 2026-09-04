import type { ThemeRegistrationRaw } from "shiki";

/*
  OHM ink syntax themes.

  The bundled GitHub themes ground code on #0d1117, a blue-black that fights the
  warm sepia painting behind the review surface. These keep the ink palette:
  warm neutral ground, stone comments, seal red for keywords, and earth tones
  for the rest.
*/

export const ohmInkDark: ThemeRegistrationRaw = {
  name: "ohm-ink-dark",
  type: "dark",
  colors: {
    "editor.background": "#14120f",
    "editor.foreground": "#ded8cf",
  },
  settings: [
    {
      scope: ["comment", "punctuation.definition.comment", "string.comment"],
      settings: { foreground: "#7c766c", fontStyle: "italic" },
    },
    {
      scope: ["keyword", "storage", "storage.type", "keyword.control", "keyword.operator.new"],
      settings: { foreground: "#c5705f" },
    },
    {
      scope: ["string", "string.quoted", "constant.other.symbol", "markup.inserted"],
      settings: { foreground: "#9aa882" },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call"],
      settings: { foreground: "#d8c58f" },
    },
    {
      scope: ["constant.numeric", "constant.language", "constant.character", "support.constant"],
      settings: { foreground: "#c39b7b" },
    },
    {
      scope: ["entity.name.type", "entity.name.class", "support.type", "support.class"],
      settings: { foreground: "#a4b3a6" },
    },
    {
      scope: ["variable", "variable.parameter", "meta.object-literal.key"],
      settings: { foreground: "#ded8cf" },
    },
    {
      scope: ["punctuation", "keyword.operator", "meta.brace"],
      settings: { foreground: "#948d82" },
    },
    {
      scope: ["entity.name.tag", "markup.deleted"],
      settings: { foreground: "#c5705f" },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: { foreground: "#d8c58f" },
    },
    {
      scope: ["markup.heading", "markup.bold"],
      settings: { foreground: "#ded8cf", fontStyle: "bold" },
    },
    {
      scope: ["invalid", "invalid.illegal"],
      settings: { foreground: "#d06052" },
    },
  ],
};

export const ohmInkLight: ThemeRegistrationRaw = {
  name: "ohm-ink-light",
  type: "light",
  colors: {
    "editor.background": "#e7dfd0",
    "editor.foreground": "#2a2724",
  },
  settings: [
    {
      scope: ["comment", "punctuation.definition.comment", "string.comment"],
      settings: { foreground: "#8a8377", fontStyle: "italic" },
    },
    {
      scope: ["keyword", "storage", "storage.type", "keyword.control", "keyword.operator.new"],
      settings: { foreground: "#a8412f" },
    },
    {
      scope: ["string", "string.quoted", "constant.other.symbol", "markup.inserted"],
      settings: { foreground: "#4f6438" },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call"],
      settings: { foreground: "#856318" },
    },
    {
      scope: ["constant.numeric", "constant.language", "constant.character", "support.constant"],
      settings: { foreground: "#8a5a2b" },
    },
    {
      scope: ["entity.name.type", "entity.name.class", "support.type", "support.class"],
      settings: { foreground: "#4c6353" },
    },
    {
      scope: ["variable", "variable.parameter", "meta.object-literal.key"],
      settings: { foreground: "#2a2724" },
    },
    {
      scope: ["punctuation", "keyword.operator", "meta.brace"],
      settings: { foreground: "#6d675e" },
    },
    {
      scope: ["entity.name.tag", "markup.deleted"],
      settings: { foreground: "#a8412f" },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: { foreground: "#856318" },
    },
    {
      scope: ["markup.heading", "markup.bold"],
      settings: { foreground: "#2a2724", fontStyle: "bold" },
    },
    {
      scope: ["invalid", "invalid.illegal"],
      settings: { foreground: "#a7352b" },
    },
  ],
};
