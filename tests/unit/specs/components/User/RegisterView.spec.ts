import { config, mount } from "@vue/test-utils";
import RegisterView from "@/views/User/RegisterView.vue";
import { createMockClient, RequestHandler } from "mock-apollo-client";
import flushPromises from "flush-promises";
import { configMock } from "../../mocks/config";
import { CONFIG } from "@/graphql/config";
import { CREATE_USER } from "@/graphql/user";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DefaultApolloClient } from "@vue/apollo-composable";
import Oruga from "@oruga-ui/oruga-next";
import {
  VueRouterMock,
  createRouterMock,
  injectRouterMock,
} from "vue-router-mock";
import { nullMock } from "../../common";

config.global.plugins.push(Oruga);
config.plugins.VueWrapper.install(VueRouterMock);

let requestHandlers: Record<string, RequestHandler>;

const generateWrapper = (
  customRegModeration: boolean = false,
  customRequestHandlers: Record<string, RequestHandler> = {}
) => {
  const mockClient = createMockClient();

  const config_value = {
    ...configMock,
  };
  if (customRegModeration) {
    config_value.data.config.registrationsModeration = true;
  }

  requestHandlers = {
    configQueryHandler: vi.fn().mockResolvedValue(config_value),
    createUserHandler: vi.fn().mockResolvedValue(nullMock),
    ...customRequestHandlers,
  };

  mockClient.setRequestHandler(CONFIG, requestHandlers.configQueryHandler);
  mockClient.setRequestHandler(CREATE_USER, requestHandlers.createUserHandler);

  return mount(RegisterView, {
    global: {
      stubs: ["router-link", "router-view"],
      provide: {
        [DefaultApolloClient]: mockClient,
      },
    },
  });
};

describe("Register page", () => {
  const router = createRouterMock({
    spy: {
      create: (fn) => vi.fn(fn),
      reset: (spy) => spy.mockReset(),
    },
  });
  beforeEach(() => {
    // inject it globally to ensure `useRoute()`, `$route`, etc work
    // properly and give you access to test specific functions
    injectRouterMock(router);
  });

  it("register without moderation", async () => {
    const wrapper = generateWrapper();
    expect(wrapper.router).toBe(router);
    await flushPromises();
    expect(wrapper.html()).toMatchSnapshot();
    expect(wrapper.find("form").exists()).toBe(true);
    wrapper.find('form input[type="email"]').setValue("some@email.tld");
    wrapper.find('form input[type="password"]').setValue("somepassword");
    wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();
    expect(requestHandlers.createUserHandler).toHaveBeenCalledWith({
      email: "some@email.tld",
      locale: "en_US",
      moderation: "",
      password: "somepassword",
    });
    await flushPromises();
    expect(wrapper.find("form").exists()).toBe(false);
  });

  it("shows error without moderation email", async () => {
    const wrapper = generateWrapper(false, {
      createUserHandler: vi.fn().mockResolvedValue({
        errors: [{ field: "email", message: ["Bad email."] }],
      }),
    });
    expect(wrapper.find("form").exists()).toBe(true);
    wrapper.find('form input[type="email"]').setValue("some@email.tld");
    wrapper.find('form input[type="password"]').setValue("somepassword");
    wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();
    expect(requestHandlers.createUserHandler).toBeCalledTimes(1);
    expect(requestHandlers.createUserHandler).toHaveBeenCalledWith({
      email: "some@email.tld",
      locale: "en_US",
      moderation: "",
      password: "somepassword",
    });
    await flushPromises();
    expect(wrapper.find("form").exists()).toBe(true);
    expect(wrapper.find(".o-field__message-danger").text()).toContain(
      "Bad email."
    );
  });

  it("shows error without moderation password", async () => {
    const wrapper = generateWrapper(false, {
      createUserHandler: vi.fn().mockResolvedValue({
        errors: [{ field: "password", message: ["Bad password."] }],
      }),
    });
    expect(wrapper.find("form").exists()).toBe(true);
    wrapper.find('form input[type="email"]').setValue("some@email.tld");
    wrapper.find('form input[type="password"]').setValue("somepassword");
    wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();
    expect(requestHandlers.createUserHandler).toBeCalledTimes(1);
    expect(requestHandlers.createUserHandler).toHaveBeenCalledWith({
      email: "some@email.tld",
      locale: "en_US",
      moderation: "",
      password: "somepassword",
    });
    await flushPromises();
    expect(wrapper.find("form").exists()).toBe(true);
    expect(wrapper.find(".o-field__message-danger").text()).toContain(
      "Bad password."
    );
  });

  it("register with moderation", async () => {
    const wrapper = generateWrapper(true);
    expect(wrapper.router).toBe(router);
    await flushPromises();
    expect(wrapper.html()).toMatchSnapshot();
    expect(wrapper.find("form").exists()).toBe(true);
    wrapper.find('form input[type="email"]').setValue("some@email.tld");
    wrapper.find('form input[type="password"]').setValue("somepassword");
    wrapper.find("form .o-input__textarea").setValue("text for moderation");
    wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();
    expect(requestHandlers.createUserHandler).toHaveBeenCalledWith({
      email: "some@email.tld",
      locale: "en_US",
      moderation: "text for moderation",
      password: "somepassword",
    });
    await flushPromises();
    expect(wrapper.find("form").exists()).toBe(false);
  });

  it("shows error with moderation", async () => {
    const wrapper = generateWrapper(true, {
      createUserHandler: vi.fn().mockResolvedValue({
        errors: [{ field: null, message: ["Bad moderation."] }],
      }),
    });
    await flushPromises();
    expect(wrapper.find("form").exists()).toBe(true);
    wrapper.find('form input[type="email"]').setValue("some@email.tld");
    wrapper.find('form input[type="password"]').setValue("somepassword");
    wrapper.find("form .o-input__textarea").setValue("text for moderation");
    wrapper.find("form").trigger("submit");
    await wrapper.vm.$nextTick();
    expect(requestHandlers.createUserHandler).toBeCalledTimes(1);
    expect(requestHandlers.createUserHandler).toHaveBeenCalledWith({
      email: "some@email.tld",
      locale: "en_US",
      moderation: "text for moderation",
      password: "somepassword",
    });
    await flushPromises();
    expect(wrapper.find("form").exists()).toBe(true);
    expect(wrapper.find(".o-field__message-danger").text()).toContain(
      "Bad moderation."
    );
  });
});
