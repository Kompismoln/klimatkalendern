import { describe, it, expect, vi, beforeEach } from "vitest";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { config, shallowMount } from "@vue/test-utils";
import buildCurrentUserResolver from "@/apollo/user";
import flushPromises from "flush-promises";
import { cache } from "@/apollo/memory";
import {
  createMockClient,
  MockApolloClient,
  RequestHandler,
} from "mock-apollo-client";
import AdminUserProfile from "@/views/Admin/AdminUserProfile.vue";
import { GET_USER } from "@/graphql/user";
import { LANGUAGES_CODES } from "@/graphql/admin";
import { createRouter, createWebHistory, Router } from "vue-router";
import { routes } from "@/router";
import { Oruga } from "@oruga-ui/oruga-next";

let router: Router;

let mockClient: MockApolloClient | null;
let requestHandlers: Record<string, RequestHandler>;

const languageCodeMock = {
  data: {
    languages: [
      {
        __typename: "Language",
        code: "fr",
        name: "French",
      },
      {
        __typename: "Language",
        code: "en",
        name: "English",
      },
    ],
  },
};

const getUsersMock = {
  data: {
    user: {
      __typename: "User",
      actors: [
        {
          __typename: "Person",
          avatar: null,
          domain: null,
          id: "11371",
          name: "Truc",
          preferredUsername: "truc",
          summary: null,
          type: "PERSON",
          url: "http://mobilizon.test/@truc",
        },
      ],
      confirmedAt: "2025-08-30T09:56:59Z",
      currentSignInAt: null,
      currentSignInIp: null,
      disabled: false,
      email: "truc@mobilizon.test",
      id: "1234",
      lastSignInAt: "2025-08-28T12:33:03Z",
      lastSignInIp: "176.171.166.30",
      locale: "fr",
      mediaSize: 7093555,
      participations: {
        __typename: "PaginatedParticipantList",
        total: 14,
      },
      role: "USER",
    },
  },
};

config.global.plugins.push(Oruga);

const generateWrapper = () => {
  mockClient = createMockClient({
    cache,
    resolvers: buildCurrentUserResolver(cache),
  });
  requestHandlers = {
    languagecode: vi.fn().mockResolvedValue(languageCodeMock),
    get_users: vi.fn().mockResolvedValue(getUsersMock),
  };
  mockClient.setRequestHandler(LANGUAGES_CODES, requestHandlers.languagecode);
  mockClient.setRequestHandler(GET_USER, requestHandlers.get_users);

  const wrapper = shallowMount(AdminUserProfile, {
    props: { id: "1234" },
    stubs: ["router-link", "router-view"],
    global: {
      provide: {
        [DefaultApolloClient]: mockClient,
      },
      plugins: [router],
    },
  });
  return wrapper;
};

describe("UsersView", () => {
  beforeEach(async () => {
    router = createRouter({
      history: createWebHistory(),
      routes: routes,
    });

    // await router.isReady();
  });

  it("Show simple list", async () => {
    const wrapper = generateWrapper();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
    expect(requestHandlers.languagecode).toHaveBeenCalled();
    expect(requestHandlers.get_users).toHaveBeenCalled();
    expect(wrapper.html()).toMatchSnapshot();
  });
});
