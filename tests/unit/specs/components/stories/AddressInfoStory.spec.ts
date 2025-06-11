import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import AddressInfoStory from "@/components/Address/AddressInfo.story.vue";

describe("Address Info Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(AddressInfoStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
