import { beforeEach, describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import EventCardStory from "@/components/Event/EventCard.story.vue";
import {
  createMockIntersectionObserver,
  getMockClient,
} from "../../mocks/client";
import { DEFAULT_PICTURE } from "@/graphql/config";

describe("Event Card Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(EventCardStory, {
      global: getMockClient([DEFAULT_PICTURE]),
    });
  };
  beforeEach(() => {
    createMockIntersectionObserver();
  });
  it("Default", async () => {
    generateWrapper();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
