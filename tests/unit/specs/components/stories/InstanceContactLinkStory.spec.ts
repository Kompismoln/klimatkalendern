import InstanceContactLinkStory from "@/components/About/InstanceContactLink.story.vue";
import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";

describe("Instance Contact Link Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(InstanceContactLinkStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
