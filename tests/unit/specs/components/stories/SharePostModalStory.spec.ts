import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import SharePostModalStory from "@/components/Post/SharePostModal.story.vue";

describe("Share Post Modal Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(SharePostModalStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
