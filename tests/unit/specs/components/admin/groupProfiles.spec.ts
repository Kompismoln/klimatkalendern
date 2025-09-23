import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { getMockClient, requestHandlers } from "../../mocks/client";
import GroupProfiles from "@/views/Admin/GroupProfiles.vue";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { LIST_GROUPS } from "@/graphql/group";
import { htmlRemoveId } from "../../common";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const groups_mock = {
  data: {
    groups: {
      __typename: "PaginatedGroupList",
      elements: [
        {
          __typename: "Group",
          avatar: null,
          banner: null,
          domain: null,
          id: "1125368",
          name: "Group #1",
          organizedEvents: {
            __typename: "PaginatedEventList",
            elements: [],
            total: 0,
          },
          preferredUsername: "group1",
          summary: null,
          suspended: false,
          type: "GROUP",
          url: "https://mobilizon.test/@group1",
        },
        {
          __typename: "Group",
          avatar: null,
          banner: null,
          domain: null,
          id: "175368",
          name: "Group #4",
          organizedEvents: {
            __typename: "PaginatedEventList",
            elements: [],
            total: 0,
          },
          preferredUsername: "group4",
          summary: null,
          suspended: false,
          type: "GROUP",
          url: "https://mobilizon.test/@group4",
        },
        {
          __typename: "Group",
          avatar: null,
          banner: null,
          domain: null,
          id: "1126368",
          name: "Group #2",
          organizedEvents: {
            __typename: "PaginatedEventList",
            elements: [],
            total: 0,
          },
          preferredUsername: "group2",
          summary: null,
          suspended: false,
          type: "GROUP",
          url: "https://mobilizon.test/@group2",
        },
      ],
      total: 3,
    },
  },
};

const generateWrapper = (mock_groups = {}) => {
  const global_data = getMockClient([[LIST_GROUPS, mock_groups]]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(GroupProfiles, {
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("GroupProfiles", () => {
  it("Show simple", async () => {
    const wrapper = generateWrapper(groups_mock);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(1);
    expect(requestHandlers.handle_0).toHaveBeenCalledWith({
      domain: "",
      limit: 10,
      local: true,
      name: "",
      page: 1,
      preferredUsername: "",
      suspended: false,
    });
  });
});
