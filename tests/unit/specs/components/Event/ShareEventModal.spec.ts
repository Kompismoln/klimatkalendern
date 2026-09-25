import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { getMockClient, requestHandlers } from "../../mocks/client";
import { htmlRemoveId } from "../../common";
import ShareEventModal from "@/components/Event/ShareEventModal.vue";
import { EventVisibility, EventStatus } from "@/types/enums";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const generateWrapper = (event: any, eventCapacityOK: boolean = true) => {
  const global_data = getMockClient([]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(ShareEventModal, {
    props: {
      event: event,
      eventCapacityOK: eventCapacityOK,
    },
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("ShareEventModal", () => {
  it("Show Public", async () => {
    const wrapper = generateWrapper({
      title: "hello",
      url: "https://mobilizon.fr/events/an-uuid",
      visibility: EventVisibility.PUBLIC,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show Private", async () => {
    const wrapper = generateWrapper({
      title: "hello",
      url: "https://mobilizon.fr/events/an-uuid",
      visibility: EventVisibility.PRIVATE,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show Cancelled", async () => {
    const wrapper = generateWrapper({
      title: "hello",
      url: "https://mobilizon.fr/events/an-uuid",
      visibility: EventVisibility.PUBLIC,
      status: EventStatus.CANCELLED,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show No seats left", async () => {
    const wrapper = generateWrapper(
      {
        title: "hello",
        url: "https://mobilizon.fr/events/an-uuid",
        visibility: EventVisibility.PUBLIC,
      },
      false
    );
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });
});
