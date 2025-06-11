import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import UnloggedIntroductionStory from "@/components/Home/UnloggedIntroduction.story.vue";

describe("Unlogged Introduction Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(UnloggedIntroductionStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
