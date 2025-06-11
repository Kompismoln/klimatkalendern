import { afterEach, describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import CategoryCardStory from "@/components/Categories/CategoryCard.story.vue";

describe("Category Card Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(CategoryCardStory);
  };
  afterEach(() => {});
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
