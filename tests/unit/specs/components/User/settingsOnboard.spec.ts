import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { getMockClient, requestHandlers } from "../../mocks/client";
import SettingsOnboard from "@/views/User/SettingsOnboard.vue";
import { config, shallowMount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { USER_SETTINGS } from "@/graphql/user";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const settings_mock = {
  data: {},
};

const generateWrapper = (mock_settings = {}, step) => {
  const global_data = getMockClient([[USER_SETTINGS, mock_settings]]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return shallowMount(SettingsOnboard, {
    props: {
      step: step,
    },
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("SettingsOnboard", () => {
  it("Show simple - step 1", async () => {
    const wrapper = generateWrapper(settings_mock, 1);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.html()).toMatchSnapshot();
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(1);
    expect(requestHandlers.handle_0).toHaveBeenCalledWith({});
  });

  it("Show simple - step 2", async () => {
    const wrapper = generateWrapper(settings_mock, 2);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.html()).toMatchSnapshot();
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(1);
    expect(requestHandlers.handle_0).toHaveBeenCalledWith({});
  });

  it("Show simple - step 3", async () => {
    const wrapper = generateWrapper(settings_mock, 3);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.html()).toMatchSnapshot();
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(1);
    expect(requestHandlers.handle_0).toHaveBeenCalledWith({});
  });
});
