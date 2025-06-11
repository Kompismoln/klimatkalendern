import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import PopoverActorCardStory from "@/components/Account/PopoverActorCard.story.vue";

describe("Popover Actor Card Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(PopoverActorCardStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
