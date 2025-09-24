import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { getMockClient, requestHandlers } from "../../mocks/client";
import ProviderValidation from "@/views/User/ProviderValidation.vue";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { UPDATE_CURRENT_USER_CLIENT, LOGGED_USER } from "@/graphql/user";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const update_mock = {
  data: {},
};

const logged_mock = {
  data: {},
};

const generateWrapper = (mock_update = {}, mock_logged = {}) => {
  const global_data = getMockClient([
    [UPDATE_CURRENT_USER_CLIENT, mock_update],
    [LOGGED_USER, mock_logged],
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
    const wrapper = generateWrapper(update_mock, logged_mock);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.html()).toMatchSnapshot();
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(0);
    expect(requestHandlers.handle_1).toHaveBeenCalledTimes(0);
  });
});
