import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import ShareEventModalStory from "@/components/Event/ShareEventModal.story.vue";

describe("Share Event Modal Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(ShareEventModalStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
