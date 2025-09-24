import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { getMockClient, requestHandlers } from "../../mocks/client";
import EmailValidate from "@/views/User/EmailValidate.vue";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { VALIDATE_EMAIL } from "@/graphql/user";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const email_mock = {
  data: {
    id: "987654",
  },
};

const generateWrapper = (mock_email = {}) => {
  const global_data = getMockClient([[VALIDATE_EMAIL, mock_email]]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(EmailValidate, {
    props: {
      token: "azerty123456789",
    },
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("EmailValidate", () => {
  it("Show simple", async () => {
    const wrapper = generateWrapper(email_mock);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.html()).toMatchSnapshot();
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(1);
    expect(requestHandlers.handle_0).toHaveBeenCalledWith({
      token: "azerty123456789",
    });
  });
});
