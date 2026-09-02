import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/App.vue";
import { RESPONSE_ENVELOPE_ELEMENT_ID } from "@/response-envelope";

const { copyMock } = vi.hoisted(() => ({
  copyMock: vi.fn().mockResolvedValue(true),
}));

vi.mock("copy-to-clipboard", () => ({
  default: copyMock,
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
  beforeEach(() => {
    copyMock.mockClear();
  });

  it("renders response identity, Markdown, and accessible actions", async () => {
    embed(JSON.stringify(envelope));
    const wrapper = mount(App);

    await vi.waitFor(() => {
      expect(wrapper.find(".ohm-markdown h1").text()).toBe("Reviewed response");
    });

    expect(wrapper.text()).toContain("session:entry");
    expect(
      wrapper.find('aside[aria-labelledby="scratchpad-heading"]').exists(),
    ).toBe(true);
    expect(
      wrapper.find('textarea[aria-label="Scratchpad notes"]').exists(),
    ).toBe(true);
    expect(wrapper.find('button[aria-label^="Theme:"]').exists()).toBe(true);
    expect(
      wrapper.find('button[aria-label="Copy response Markdown"]').exists(),
    ).toBe(true);

    await wrapper
      .get('button[aria-label="Copy response Markdown"]')
      .trigger("click");
    await flushPromises();

    expect(copyMock).toHaveBeenCalledWith(envelope.text);
    expect(wrapper.text()).toContain("Copied");
    expect(wrapper.text()).toContain("Response Markdown copied to clipboard.");

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
