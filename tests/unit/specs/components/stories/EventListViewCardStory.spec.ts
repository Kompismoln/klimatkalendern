import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import EventListViewCardStory from "@/components/Event/EventListViewCard.story.vue";

describe("Event List View Card Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(EventListViewCardStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
