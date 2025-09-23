import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { getMockClient, requestHandlers } from "../../mocks/client";
import AdminProfile from "@/views/Admin/AdminProfile.vue";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import {
  GET_PERSON,
  SUSPEND_PROFILE,
  UNSUSPEND_PROFILE,
} from "@/graphql/actor";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const person_mock = {
  data: {
    person: {
      __typename: "Person",
      avatar: null,
      banner: null,
      domain: null,
      feedTokens: [
        {
          __typename: "FeedToken",
          token: "Se4rSUMzeX8KMC4bz7Yybq",
        },
      ],
      id: "2",
      mediaSize: 0,
      memberships: {
        __typename: "PaginatedMemberList",
        elements: [],
        total: 0,
      },
      name: "CurrentPerson",
      organizedEvents: {
        __typename: "PaginatedEventList",
        elements: [],
        total: 0,
      },
      participations: {
        __typename: "PaginatedParticipantList",
        elements: [],
        total: 0,
      },
      preferredUsername: "current",
      summary: null,
      suspended: false,
      type: "PERSON",
      url: "https://mobilizon.test/@current",
      user: {
        __typename: "User",
        email: "current@mobilizon.test",
        id: "1",
      },
    },
  },
};

const generateWrapper = (mock_person: any = {}) => {
  const global_data = getMockClient([
    [GET_PERSON, mock_person],
    SUSPEND_PROFILE,
    UNSUSPEND_PROFILE,
  ]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(AdminProfile, {
    props: {
      id: "987654",
    },
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("AdminProfile", () => {
  it("Show simple", async () => {
    const wrapper = generateWrapper(person_mock);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.html()).toMatchSnapshot();
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(1);
    expect(requestHandlers.handle_1).toHaveBeenCalledTimes(0);
    expect(requestHandlers.handle_2).toHaveBeenCalledTimes(0);
    expect(requestHandlers.handle_0).toHaveBeenCalledWith({
      actorId: "987654",
      membershipsLimit: 10,
      membershipsPage: 1,
      organizedEventsLimit: 10,
      organizedEventsPage: 1,
      participationLimit: 10,
      participationsPage: 1,
    });
  });
});
