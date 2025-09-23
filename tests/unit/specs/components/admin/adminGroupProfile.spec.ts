import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { GET_GROUP, REFRESH_PROFILE } from "@/graphql/group";
import { SUSPEND_PROFILE, UNSUSPEND_PROFILE } from "@/graphql/actor";
import { getMockClient, requestHandlers } from "../../mocks/client";
import AdminGroupProfile from "@/views/Admin/AdminGroupProfile.vue";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const generateWrapper = (group_mock: any = {}) => {
  const global_data = getMockClient([
    [GET_GROUP, group_mock],
    REFRESH_PROFILE,
    SUSPEND_PROFILE,
    UNSUSPEND_PROFILE,
  ]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(AdminGroupProfile, {
    props: {
      id: "123456",
    },
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

const group_mock = {
  data: {
    getGroup: {
      __typename: "Group",
      avatar: null,
      banner: null,
      domain: null,
      id: "1125368",
      manuallyApprovesFollowers: false,
      mediaSize: 0,
      members: {
        __typename: "PaginatedMemberList",
        elements: [
          {
            __typename: "Member",
            actor: {
              __typename: "Person",
              avatar: null,
              domain: null,
              id: "6548012",
              name: "member #1",
              preferredUsername: "member_1",
              summary: "member #1",
              type: "PERSON",
              url: "https://mobilizon.test/@member_1",
            },
            id: "3d70f3c8-050f-49dd-b7fe-9bb4398225c8",
            insertedAt: "2021-06-13T09:24:47",
            role: "ADMINISTRATOR",
          },
        ],
        total: 1,
      },
      name: "Group name",
      openness: "INVITE_ONLY",
      organizedEvents: {
        __typename: "PaginatedEventList",
        elements: [],
        total: 30410,
      },
      physicalAddress: null,
      posts: {
        __typename: "PaginatedPostList",
        elements: [],
        total: 0,
      },
      preferredUsername: "group_name",
      resources: {
        __typename: "PaginatedResourceList",
        elements: [],
        total: 0,
      },
      summary: null,
      suspended: false,
      todoLists: {
        __typename: "PaginatedTodoListList",
        elements: [],
        total: 0,
      },
      type: "GROUP",
      url: "https://mobilizon.test/@group_name",
      visibility: "PUBLIC",
    },
  },
};

describe("AdminGroupProfile", () => {
  it("Show simple", async () => {
    const wrapper = generateWrapper(group_mock);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.html()).toMatchSnapshot();
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(1);
    expect(requestHandlers.handle_1).toHaveBeenCalledTimes(0);
    expect(requestHandlers.handle_2).toHaveBeenCalledTimes(0);
    expect(requestHandlers.handle_3).toHaveBeenCalledTimes(0);
    expect(requestHandlers.handle_0).toHaveBeenCalledWith({
      id: "123456",
      membersLimit: 10,
      membersPage: 1,
      organizedEventsLimit: 10,
      organizedEventsPage: 1,
      postsLimit: 10,
      postsPage: 1,
    });
  });
});
