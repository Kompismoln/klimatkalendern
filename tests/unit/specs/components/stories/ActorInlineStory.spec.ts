import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import ActorInlineStory from "@/components/Account/ActorInline.story.vue";

describe("Actor Inline Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(ActorInlineStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
