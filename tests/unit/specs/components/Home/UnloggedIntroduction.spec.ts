import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { getMockClient } from "../../mocks/client";
import { htmlRemoveId } from "../../common";
import UnloggedIntroduction from "@/components/Home/UnloggedIntroduction.vue";
import { reactive } from "vue";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const generateWrapper = (props: any) => {
  const global_data = getMockClient([]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(UnloggedIntroduction, {
    props: props,
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

const mockconfig = reactive({
  name: "My instance name",
  description: "An instance that doesn't exist",
  slogan: "Test! Test! Test!",
  registrationsOpen: true,
});

const mockconfigClosed = reactive({ ...config, registrationsOpen: false });

describe("UnloggedIntroduction", () => {
  it("Show open", async () => {
    const wrapper = generateWrapper({
      config: mockconfig,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show close", async () => {
    const wrapper = generateWrapper({
      config: mockconfigClosed,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });
});
