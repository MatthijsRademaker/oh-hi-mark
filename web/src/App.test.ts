import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import App from "@/App.vue";
import { RESPONSE_ENVELOPE_ELEMENT_ID } from "@/response-envelope";

// Scratchpad mounts inside App and reaches for the clipboard.
vi.mock("copy-to-clipboard", () => ({
  default: vi.fn().mockResolvedValue(true),
}));

const envelope = {
  responseId: "session:entry",
  sessionId: "session",
  entryId: "entry",
  text: "# Reviewed response\n\nUseful **Markdown**.",
};

function embed(payload: string): void {
  const element = document.createElement("script");
  element.id = RESPONSE_ENVELOPE_ELEMENT_ID;
  element.type = "application/json";
  element.textContent = payload;
  document.body.append(element);
}

describe("OHM review shell", () => {
  it("renders Markdown and accessible review surfaces", async () => {
    embed(JSON.stringify(envelope));
    const wrapper = mount(App);

    await vi.waitFor(() => {
      expect(wrapper.find(".ohm-markdown h1").text()).toBe("Reviewed response");
    });

    expect(
      wrapper.find('aside[aria-labelledby="scratchpad-heading"]').exists(),
    ).toBe(true);
    expect(
      wrapper.find('textarea[aria-label="Scratchpad notes"]').exists(),
    ).toBe(true);
    expect(wrapper.find('button[aria-label^="Theme:"]').exists()).toBe(true);

    wrapper.unmount();
  });

  it("cycles system, light, and dark theme modes", async () => {
    embed(JSON.stringify(envelope));
    const wrapper = mount(App);
    const themeButton = wrapper.get('button[aria-label^="Theme:"]');

    expect(document.documentElement.dataset.theme).toBe("system");
    await themeButton.trigger("click");
    expect(document.documentElement.dataset.theme).toBe("light");
    await themeButton.trigger("click");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    wrapper.unmount();
  });

  it("shows actionable error for malformed envelope", () => {
    embed("{not-json");
    const wrapper = mount(App);

    expect(wrapper.get('[role="alert"]').text()).toContain(
      "Response unavailable",
    );
    expect(wrapper.get('[role="alert"]').text()).toContain(
      "Embedded OHM response envelope is invalid",
    );
    expect(wrapper.find("article").exists()).toBe(false);

    wrapper.unmount();
  });
});
