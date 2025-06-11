import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import InlineAddressStory from "@/components/Address/InlineAddress.story.vue";

describe("Inline Address Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(InlineAddressStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
