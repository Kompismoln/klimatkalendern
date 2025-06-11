import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import MaterialIconStory from "@/components/core/MaterialIcon.story.vue";

describe("Material Icon Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(MaterialIconStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
