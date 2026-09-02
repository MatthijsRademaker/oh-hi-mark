import { describe, expect, it } from "vitest";

import { renderMarkdown } from "@/markdown";

describe("safe Markdown renderer", () => {
  it("keeps raw HTML, scripts, and event handlers inert", async () => {
    const html = await renderMarkdown(`
# Safety

<script>alert('x')</script>

<div onclick="alert('x')">not markup</div>

[bad](javascript:alert('x'))
`);

    expect(html).not.toMatch(/<script\b|<[^>]+\sonclick=|href="javascript:/i);
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("<h1>Safety</h1>");
  });

  it("adds safe external-link attributes", async () => {
    const html = await renderMarkdown("[Docs](https://example.com/docs)");

    expect(html).toContain('href="https://example.com/docs"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("renders image syntax as inert label without source URL", async () => {
    const html = await renderMarkdown(
      "![Architecture sketch](https://tracking.example/pixel.png)",
    );

    expect(html).not.toContain("<img");
    expect(html).not.toContain("tracking.example");
    expect(html).toContain("Image omitted: Architecture sketch");
    expect(html).toContain("ohm-image-placeholder");
  });

  it("highlights supported code and safely falls back for unknown languages", async () => {
    const supported = await renderMarkdown(
      "```ts\nconst answer: number = 42\n```",
    );
    const unknown = await renderMarkdown(
      "```made-up-lang\n<tag>still text</tag>\n```",
    );

    expect(supported).toContain('class="shiki');
    expect(supported).toContain("language-ts");
    expect(unknown).toContain("&lt;tag&gt;still text&lt;/tag&gt;");
    expect(unknown).not.toContain("<tag>");
  });
});
