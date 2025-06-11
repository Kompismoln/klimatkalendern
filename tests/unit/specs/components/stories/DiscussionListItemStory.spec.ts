import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import DiscussionListItemStory from "@/components/Discussion/DiscussionListItem.story.vue";

describe("Discussion List Item Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(DiscussionListItemStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
