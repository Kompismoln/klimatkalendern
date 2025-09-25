import { beforeEach, describe, it, expect, vi } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { getMockClient, requestHandlers } from "../../mocks/client";
import ProviderValidation from "@/views/User/ProviderValidation.vue";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { UPDATE_CURRENT_USER_CLIENT, LOGGED_USER } from "@/graphql/user";

vi.mock("@/utils/html", () => {
  return {
    getValueFromMeta: (name: string) => name,
    escapeHtml: (html: string) => html,
  };
});
config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const logged_mock = {
  data: {
    loggedUser: {
      __typename: "User",
      defaultActor: {
        __typename: "Person",
        id: "1",
        unreadConversationsCount: 0,
      },
      id: "1",
    },
  },
};

const generateWrapper = (mock_logged = {}) => {
  const global_data = getMockClient([
    [LOGGED_USER, mock_logged],
    UPDATE_CURRENT_USER_CLIENT,
  ]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(ProviderValidation, {
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("ProviderValidation", () => {
  it("Show simple", async () => {
    const wrapper = generateWrapper(logged_mock);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.html()).toMatchSnapshot();
    expect(requestHandlers.handle_1).toHaveBeenCalledTimes(0);
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(1);
    expect(requestHandlers.handle_0).toHaveBeenCalledWith({});
  });
});
