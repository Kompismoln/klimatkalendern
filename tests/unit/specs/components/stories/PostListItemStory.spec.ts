import { beforeEach, describe, expect, it } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import PostListItemStory from "@/components/Post/PostListItem.story.vue";
import {
  createMockIntersectionObserver,
  getMockClient,
} from "../../mocks/client";
import { CONFIG } from "@/graphql/config";

describe("Post List Item Story", () => {
  let wrapper: VueWrapper;

  const generateWrapper = () => {
    wrapper = mount(PostListItemStory, {
      global: getMockClient([CONFIG]),
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
