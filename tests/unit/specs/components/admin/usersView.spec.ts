import { describe, it, expect, vi, beforeEach } from "vitest";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { config, mount } from "@vue/test-utils";
import buildCurrentUserResolver from "@/apollo/user";
import flushPromises from "flush-promises";
import { cache } from "@/apollo/memory";
import {
  createMockClient,
  MockApolloClient,
  RequestHandler,
} from "mock-apollo-client";
import UsersView from "@/views/Admin/UsersView.vue";
import { LIST_USERS } from "@/graphql/user";
import { LANGUAGES_CODES } from "@/graphql/admin";
import { createRouter, createWebHistory, Router } from "vue-router";
import { routes } from "@/router";
import { Oruga } from "@oruga-ui/oruga-next";
import { htmlRemoveId } from "../../common";
import { CONFIG } from "@/graphql/config";

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

const listUsersMock = {
  data: {
    users: {
      __typename: "Users",
      elements: [
        {
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
          id: "6",
          locale: "en",
          settings: null,
        },
        {
          __typename: "User",
          actors: [
            {
              __typename: "Person",
              avatar: null,
              domain: null,
              id: "1",
              name: "Administrator",
              preferredUsername: "administrator",
              summary: null,
              type: "PERSON",
              url: "https://mobilizon.test/@administrator",
            },
          ],
          confirmedAt: "2025-06-04T16:19:48Z",
          currentSignInAt: "2025-09-11T16:10:03Z",
          currentSignInIp: "127.0.0.1",
          disabled: false,
          email: "admin@mobilizon.test",
          id: "1",
          locale: "en",
          settings: {
            __typename: "UserSettings",
            timezone: "Europe/Paris",
          },
        },
      ],
      total: 2,
    },
  },
};

config.global.plugins.push(Oruga);

const generateWrapper = (currentModeration = false) => {
  mockClient = createMockClient({
    cache,
    resolvers: buildCurrentUserResolver(cache),
  });
  requestHandlers = {
    config: vi.fn().mockResolvedValue({
      data: {
        config: {
          registrationsModeration: currentModeration,
        },
      },
    }),
    languagecode: vi.fn().mockResolvedValue(languageCodeMock),
    list_users: vi.fn().mockResolvedValue(listUsersMock),
  };
  mockClient.setRequestHandler(CONFIG, requestHandlers.config);
  mockClient.setRequestHandler(LANGUAGES_CODES, requestHandlers.languagecode);
  mockClient.setRequestHandler(LIST_USERS, requestHandlers.list_users);

  const wrapper = mount(UsersView, {
    props: {},
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
    expect(requestHandlers.list_users).toHaveBeenCalled();
    expect(requestHandlers.list_users).toHaveBeenCalledWith({
      currentSignInIp: "",
      email: "",
      limit: 10,
      page: 1,
      pendingUser: false,
    });
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show list with moderation", async () => {
    const wrapper = generateWrapper(true);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
    expect(requestHandlers.languagecode).toHaveBeenCalledTimes(0);
    expect(requestHandlers.list_users).toHaveBeenCalledTimes(1);
    expect(requestHandlers.list_users).toHaveBeenCalledWith({
      currentSignInIp: "",
      email: "",
      limit: 10,
      page: 1,
      pendingUser: true,
    });
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();

    wrapper.vm.pendingFieldValue = false;
    //wrapper.find('input[type="checkbox"]').trigger("change");
    wrapper.find('input[type="text"]').setValue("@email.tld");
    wrapper.find('button[type="button"]').trigger("click");
    await flushPromises();
    expect(requestHandlers.list_users).toHaveBeenCalledTimes(3);
    expect(requestHandlers.list_users).toHaveBeenNthCalledWith(3, {
      currentSignInIp: "",
      email: "@email.tld",
      limit: 10,
      page: 1,
      pendingUser: false,
    });
  });
});
