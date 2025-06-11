import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import ProfileOnboardingStory from "@/components/Account/ProfileOnboarding.story.vue";

describe("Profile On boarding Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(ProfileOnboardingStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
