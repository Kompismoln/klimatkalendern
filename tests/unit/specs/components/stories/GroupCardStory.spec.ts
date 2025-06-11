import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import GroupCardStory from "@/components/Group/GroupCard.story.vue";

describe("Group Card Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(GroupCardStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
