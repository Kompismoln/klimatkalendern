import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { getMockClient, requestHandlers } from "../../mocks/client";
import SendPasswordReset from "@/views/User/SendPasswordReset.vue";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { SEND_RESET_PASSWORD } from "@/graphql/auth";
import { htmlRemoveId } from "../../common";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const generateWrapper = () => {
  const global_data = getMockClient([SEND_RESET_PASSWORD]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(SendPasswordReset, {
    props: {
      email: "some@email.tld",
    },
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("SendPasswordReset", () => {
  it("Show simple", async () => {
    const wrapper = generateWrapper();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(0);

    wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();

    expect(requestHandlers.handle_0).toHaveBeenCalledWith({
      email: "some@email.tld",
    });
  });
});
