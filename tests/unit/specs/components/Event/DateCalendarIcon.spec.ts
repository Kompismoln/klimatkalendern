import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { getMockClient } from "../../mocks/client";
import { htmlRemoveId } from "../../common";
import DateCalendarIcon from "@/components/Event/DateCalendarIcon.vue";

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
  return mount(DateCalendarIcon, {
    props: props,
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("DateCalendarIcon", () => {
  it("Show new", async () => {
    const wrapper = generateWrapper({
      date: new Date().toString(),
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show small", async () => {
    const wrapper = generateWrapper({
      date: new Date().toString(),
      small: true,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });
});
