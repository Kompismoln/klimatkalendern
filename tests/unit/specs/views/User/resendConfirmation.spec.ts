import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { getMockClient, requestHandlers } from "../../mocks/client";
import ResendConfirmation from "@/views/User/ResendConfirmation.vue";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { RESEND_CONFIRMATION_EMAIL } from "@/graphql/auth";

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
  const global_data = getMockClient([RESEND_CONFIRMATION_EMAIL]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(ResendConfirmation, {
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("ResendConfirmation", () => {
  it("Show simple", async () => {
    const wrapper = generateWrapper();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.html()).toMatchSnapshot();
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(0);

    wrapper.find('form input[type="email"]').setValue("some@email.tld");
    wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(wrapper.html()).toMatchSnapshot();

    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(1);
    expect(requestHandlers.handle_0).toHaveBeenCalledWith({
      email: "some@email.tld",
    });
  });
});
