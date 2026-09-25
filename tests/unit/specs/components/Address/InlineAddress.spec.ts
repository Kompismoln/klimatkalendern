import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { getMockClient } from "../../mocks/client";
import { htmlRemoveId } from "../../common";
import { IAddress } from "@/types/address.model";
import { reactive } from "vue";
import InlineAddress from "@/components/Address/InlineAddress.vue";

const address = reactive<IAddress>({
  description: "Locaux Motiv",
  street: "10 Rue Jangot",
  locality: "Lyon",
  postalCode: "69007",
  region: "Auvergne Rhône-Alpes",
  country: "France",
  type: "",
  timezone: "Europe/Dublin",
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

const generateWrapper = (props: any = {}) => {
  const global_data = getMockClient([]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(InlineAddress, {
    props: props,
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("InlineAddress", () => {
  it("Show with locality", async () => {
    const wrapper = generateWrapper({
      physicalAddress: address,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show without locality", async () => {
    const wrapper = generateWrapper({
      physicalAddress: { ...address, locality: null },
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });
});
