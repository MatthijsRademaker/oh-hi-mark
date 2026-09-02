import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { describe, expect, it } from "vitest";

import Scratchpad from "@/components/Scratchpad.vue";

describe("Scratchpad", () => {
  it("saves notes under response identity and restores them", async () => {
    const first = mount(Scratchpad, {
      props: { responseId: "session:entry-1" },
    });
    const textarea = first.get("textarea");

    expect(textarea.attributes("aria-label")).toBe("Scratchpad notes");
    expect(first.get("label").text()).toBe("Notes for this response");
    expect(textarea.attributes("placeholder")).toContain("Capture");

    await textarea.setValue("Check implementation details");

    expect(window.localStorage.getItem("ohm-scratchpad:session:entry-1")).toBe(
      "Check implementation details",
    );
    expect(
      window.localStorage.getItem("ohm-scratchpad:session:entry-2"),
    ).toBeNull();

    first.unmount();

    const restored = mount(Scratchpad, {
      props: { responseId: "session:entry-1" },
    });
    await nextTick();

    expect(
      (restored.get("textarea").element as HTMLTextAreaElement).value,
    ).toBe("Check implementation details");
    expect(restored.get("h2").text()).toBe("Scratchpad");

    restored.unmount();
  });

  it("does not carry notes to another response", async () => {
    window.localStorage.setItem(
      "ohm-scratchpad:session:entry-1",
      "Private note",
    );

    const wrapper = mount(Scratchpad, {
      props: { responseId: "session:entry-2" },
    });
    await nextTick();

    expect((wrapper.get("textarea").element as HTMLTextAreaElement).value).toBe(
      "",
    );
    expect(wrapper.text()).toContain("Notes save locally with this response.");

    wrapper.unmount();
  });
});
