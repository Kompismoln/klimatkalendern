import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import GroupMemberCardStory from "@/components/Group/GroupMemberCard.story.vue";

describe("Group Member Card Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(GroupMemberCardStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
