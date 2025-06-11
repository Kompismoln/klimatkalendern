import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import SkeletonEventResultStory from "@/components/Event/SkeletonEventResult.story.vue";

describe("Skeleton Event Result Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(SkeletonEventResultStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
