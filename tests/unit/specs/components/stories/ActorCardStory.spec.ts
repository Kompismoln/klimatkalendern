import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import ActorCardStory from "@/components/Account/ActorCard.story.vue";

describe("Actor Card Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(ActorCardStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
