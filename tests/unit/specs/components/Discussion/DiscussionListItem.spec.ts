import { describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { getMockClient } from "../../mocks/client";
import { htmlRemoveId } from "../../common";
import DiscussionListItem from "@/components/Discussion/DiscussionListItem.vue";
import { IDiscussion } from "@/types/discussions";
import { reactive } from "vue";

config.global.plugins.push(Oruga);

const generateWrapper = (props: any) => {
  const global_data = getMockClient([]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [];
  return mount(DiscussionListItem, {
    props: props,
    global: {
      ...global_data,
    },
  });
};

const mockdiscussion = reactive<IDiscussion>({
  title: "A discussion",
  comments: { total: 5, elements: [] },
  insertedAt: "2022-02-02T02:04:00.000Z",
  updatedAt: "2022-02-04T02:04:00.000Z",
  deletedAt: null,
  lastComment: { text: "Hello there", publishedAt: new Date().toString() },
});

const mockdiscussionWithDeletedComment = reactive<IDiscussion>({
  ...mockdiscussion,
  lastComment: {
    ...mockdiscussion.lastComment,
    deletedAt: "2022-02-06T02:04:00.000Z",
  },
});

describe("DiscussionListItem", () => {
  it("Show Basic", async () => {
    const wrapper = generateWrapper({
      discussion: mockdiscussion,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });
  it("Show Deleted comment", async () => {
    const wrapper = generateWrapper({
      discussion: mockdiscussion,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });
});
