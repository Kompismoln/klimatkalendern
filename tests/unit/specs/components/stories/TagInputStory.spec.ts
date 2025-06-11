import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import TagInputStory from "@/components/Event/TagInput.story.vue";

describe("Tag Input Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(TagInputStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
