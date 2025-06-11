import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import MobilizonPresentationStory from "@/components/Home/MobilizonPresentation.story.vue";

describe("Mobilizon Presentation Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(MobilizonPresentationStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
