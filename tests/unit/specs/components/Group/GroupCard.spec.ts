import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { getMockClient } from "../../mocks/client";
import { htmlRemoveId } from "../../common";
import GroupCard from "@/components/Group/GroupCard.vue";
import { IGroup } from "@/types/actor";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const basicGroup: IGroup = {
  name: "Framasoft",
  preferredUsername: "framasoft",
  avatar: null,
  domain: "mobilizon.fr",
  url: "",
  summary: "",
  suspended: false,
  members: { total: 0, elements: [] },
  followers: { total: 0, elements: [] },
};

const groupWithMedia: IGroup = {
  ...basicGroup,
  banner: {
    url: "https://mobilizon.fr/media/a8227a16cc80b3d20ff5ee549a29c1b20a0ca1547f8861129aae9f00c3c69d12.jpg?name=framasoft%27s%20banner.jpg",
  },
  avatar: {
    url: "https://mobilizon.fr/media/890f5396ef80081a6b1b18a5db969746cf8bb340e8a4e657d665e41f6646c539.jpg?name=framasoft%27s%20avatar.jpg",
  },
};

const groupWithFollowersOrMembers: IGroup = {
  ...groupWithMedia,
  members: { total: 2, elements: [] },
  followers: { total: 5, elements: [] },
  summary:
    "You can also use variant modifiers to target media queries like responsive breakpoints, dark mode, prefers-reduced-motion, and more. For example, use md:h-full to apply the h-full utility at only medium screen sizes and above.",
  physicalAddress: {
    description: "Nantes",
  },
};

const generateWrapper = (props: any = {}) => {
  const global_data = getMockClient([]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(GroupCard, {
    props: props,
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("GroupCard", () => {
  it("Show Empty", async () => {
    const wrapper = generateWrapper({
      group: basicGroup,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show With media", async () => {
    const wrapper = generateWrapper({
      group: groupWithMedia,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show with followers or members", async () => {
    const wrapper = generateWrapper({
      group: groupWithFollowersOrMembers,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show Row mode", async () => {
    const wrapper = generateWrapper({
      group: groupWithFollowersOrMembers,
      mode: "row",
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });
});
