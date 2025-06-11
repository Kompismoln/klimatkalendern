import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import CategoriesPreviewStory from "@/components/Home/CategoriesPreview.story.vue";
import { getMockClient } from "../../mocks/client";
import { CATEGORY_STATISTICS } from "@/graphql/statistics";

describe("Categories Preview Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(CategoriesPreviewStory, {
      global: getMockClient([CATEGORY_STATISTICS]),
    });
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
