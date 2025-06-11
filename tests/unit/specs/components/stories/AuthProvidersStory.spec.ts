import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import AuthProvidersStory from "@/components/User/AuthProviders.story.vue";

describe("Auth Providers Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(AuthProvidersStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
