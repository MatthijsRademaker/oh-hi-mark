import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Scratchpad from "@/components/Scratchpad.vue";

const { copyMock } = vi.hoisted(() => ({
  copyMock: vi.fn().mockResolvedValue(true),
}));

vi.mock("copy-to-clipboard", () => ({
  default: copyMock,
}));

describe("Scratchpad", () => {
  beforeEach(() => {
    copyMock.mockClear();
    window.localStorage.clear();
  });

  it("keeps notes ephemeral and copies exact text for the agent", async () => {
    const wrapper = mount(Scratchpad);
    const textarea = wrapper.get("textarea");
    const copyButton = wrapper.get(
      'button[aria-label="Copy scratchpad notes for agent harness"]',
    );

    expect(textarea.attributes("aria-label")).toBe("Scratchpad notes");
    expect(wrapper.get("label").text()).toBe(
      "Notes to paste into your agent harness",
    );
    expect(copyButton.attributes("disabled")).toBeDefined();

    await textarea.setValue("Check implementation details");

    expect(window.localStorage.length).toBe(0);
    expect(copyButton.attributes("disabled")).toBeUndefined();

    await copyButton.trigger("click");
    await flushPromises();

    expect(copyMock).toHaveBeenCalledWith("Check implementation details");
    expect(wrapper.text()).toContain(
      "Notes copied. Paste into your agent harness.",
    );

    wrapper.unmount();

    const fresh = mount(Scratchpad);
    expect((fresh.get("textarea").element as HTMLTextAreaElement).value).toBe(
      "",
    );
    fresh.unmount();
  });

  it("reports clipboard failure without hiding note text", async () => {
    copyMock.mockResolvedValueOnce(false);
    const wrapper = mount(Scratchpad);
    await wrapper.get("textarea").setValue("Keep this visible");

    await wrapper
      .get('button[aria-label="Copy scratchpad notes for agent harness"]')
      .trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("Could not copy notes.");
    expect((wrapper.get("textarea").element as HTMLTextAreaElement).value).toBe(
      "Keep this visible",
    );

    wrapper.unmount();
  });
});
