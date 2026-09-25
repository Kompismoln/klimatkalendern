import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { getMockClient, requestHandlers } from "../../mocks/client";
import { htmlRemoveId } from "../../common";
import FullAddressAutoComplete from "@/components/Event/FullAddressAutoComplete.vue";
import { ADDRESS } from "@/graphql/address";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const generateWrapper = (mock_addr: any = {}) => {
  const global_data = getMockClient([[ADDRESS, mock_addr]]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(FullAddressAutoComplete, {
    props: {},
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

const mock_address = {
  data: {
    searchAddress: [
      {
        __typename: "Address",
        country: "France",
        description: "Lyon",
        geom: "4.8320114;45.7578137",
        id: null,
        locality: "Lyon",
        originId: "nominatim:120965",
        pictureInfo: null,
        postalCode: null,
        region: "Auvergne-Rhône-Alpes",
        street: " ",
        timezone: null,
        type: "city",
        url: null,
      },
      {
        __typename: "Address",
        country: "États-Unis d'Amérique",
        description: "Lyon County",
        geom: "-96.1683124;38.4573987",
        id: null,
        locality: null,
        originId: "nominatim:1070375",
        pictureInfo: null,
        postalCode: null,
        region: "Kansas",
        street: " ",
        timezone: null,
        type: "county",
        url: null,
      },
      {
        __typename: "Address",
        country: "France",
        description: "Lyon",
        geom: "4.735948;45.6963425",
        id: null,
        locality: "Rhône",
        originId: "nominatim:1663048",
        pictureInfo: null,
        postalCode: null,
        region: "Auvergne-Rhône-Alpes",
        street: " ",
        timezone: null,
        type: "city",
        url: null,
      },
      {
        __typename: "Address",
        country: "États-Unis d'Amérique",
        description: "Lyon",
        geom: "-90.5420429;34.2178865",
        id: null,
        locality: "Coahoma County",
        originId: "nominatim:109907",
        pictureInfo: null,
        postalCode: null,
        region: "Mississippi",
        street: " ",
        timezone: null,
        type: "city",
        url: null,
      },
    ],
  },
};

describe("FullAddressAutoComplete", () => {
  it("Show simple", async () => {
    const wrapper = generateWrapper();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(0);
  });

  it("Show list", async () => {
    const wrapper = generateWrapper(mock_address);
    await wrapper.vm.$nextTick();
    await flushPromises();

    const input = wrapper.find("input");
    expect(input.exists()).toBeTruthy();
    await input.trigger("focus");
    await input.setValue("lyon");
    await input.trigger("input");
    await input.trigger("blur");

    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();

    await input.trigger("keydown", { key: "Down" });
    await input.trigger("keydown", { key: "Enter" });

    await wrapper.vm.$nextTick();
    await flushPromises();

    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(1);
    expect(requestHandlers.handle_0).toHaveBeenCalledWith({
      locale: "en_US",
      query: "lyon",
      type: undefined,
    });
  });
});
