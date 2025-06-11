import { describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import DateCalendarIconStory from "@/components/Event/DateCalendarIcon.story.vue";

describe("Date Calendar Icon Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(DateCalendarIconStory);
  };
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
