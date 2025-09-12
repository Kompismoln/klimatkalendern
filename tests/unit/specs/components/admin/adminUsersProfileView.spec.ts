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
import { ADMIN_UPDATE_USER, LANGUAGES_CODES } from "@/graphql/admin";
import { Oruga } from "@oruga-ui/oruga-next";
import { nullMock } from "../../common";
import {
  createRouterMock,
  injectRouterMock,
  VueRouterMock,
} from "vue-router-mock";
import { SettingsRouteName } from "@/router/settings";

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

const getUserMock = {
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
      moderation: "moderation text",
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

const getModerateMock = {
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
      moderation: "moderation text",
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
      role: "PENDING",
    },
  },
};

config.global.plugins.push(Oruga);
config.plugins.VueWrapper.install(VueRouterMock);

describe("UsersView", () => {
  const router = createRouterMock({
    spy: {
      create: (fn) => vi.fn(fn),
      reset: (spy) => spy.mockReset(),
    },
  });
  beforeEach(async () => {
    // await router.isReady();
    injectRouterMock(router);
  });

  const generateWrapper = (currentUserMock = getUserMock) => {
    mockClient = createMockClient({
      cache,
      resolvers: buildCurrentUserResolver(cache),
    });
    requestHandlers = {
      languagecode: vi.fn().mockResolvedValue(languageCodeMock),
      get_users: vi.fn().mockResolvedValue(currentUserMock),
      update_user: vi.fn().mockResolvedValue(nullMock),
    };
    mockClient.setRequestHandler(LANGUAGES_CODES, requestHandlers.languagecode);
    mockClient.setRequestHandler(GET_USER, requestHandlers.get_users);
    mockClient.setRequestHandler(
      ADMIN_UPDATE_USER,
      requestHandlers.update_user
    );

    const wrapper = shallowMount(AdminUserProfile, {
      props: { id: "1234" },
      stubs: ["router-link", "router-view"],
      global: {
        provide: {
          [DefaultApolloClient]: mockClient,
        },
      },
    });
    return wrapper;
  };

  it("Show simple list", async () => {
    const wrapper = generateWrapper();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.html()).toMatchSnapshot();
    expect(requestHandlers.languagecode).toHaveBeenCalledTimes(1);
    expect(requestHandlers.get_users).toHaveBeenCalledTimes(1);
    expect(requestHandlers.update_user).toHaveBeenCalledTimes(0);
  });

  it("Show moderate list", async () => {
    const wrapper = generateWrapper(getModerateMock);
    expect(wrapper.router).toBe(router);
    wrapper.router.push.mockReset();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.html()).toMatchSnapshot();
    expect(requestHandlers.languagecode).toHaveBeenCalledTimes(0);
    expect(requestHandlers.get_users).toHaveBeenCalledTimes(1);
    expect(requestHandlers.update_user).toHaveBeenCalledTimes(0);
    const btn = wrapper.find('o-button-stub[variant="success"]');
    expect(btn.exists()).toBe(true);
    btn.trigger("click");
    await flushPromises();
    expect(requestHandlers.languagecode).toHaveBeenCalledTimes(0);
    expect(requestHandlers.get_users).toHaveBeenCalledTimes(1);
    expect(requestHandlers.update_user).toHaveBeenCalledTimes(1);
    expect(requestHandlers.update_user).toHaveBeenCalledWith({
      id: "1234",
      notify: true,
      role: "USER",
    });
    await flushPromises();
    await flushPromises();
    expect(wrapper.router.push).toHaveBeenCalledWith({
      name: SettingsRouteName.ADMIN_USER_PROFILE,
      id: "1234",
    });
  });
});
