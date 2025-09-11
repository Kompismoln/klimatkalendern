import { config, mount } from "@vue/test-utils";
import ValidateUser from "@/views/User/ValidateUser.vue";
import { createMockClient, RequestHandler } from "mock-apollo-client";
import flushPromises from "flush-promises";
import { VALIDATE_USER, UPDATE_CURRENT_USER_CLIENT } from "@/graphql/user";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DefaultApolloClient } from "@vue/apollo-composable";
import Oruga from "@oruga-ui/oruga-next";
import {
  VueRouterMock,
  createRouterMock,
  injectRouterMock,
} from "vue-router-mock";
import { nullMock } from "../../common";
import * as auth_mod from "@/utils/auth.ts";

config.global.plugins.push(Oruga);
config.plugins.VueWrapper.install(VueRouterMock);

vi.spyOn(auth_mod, "saveTokenData");
vi.spyOn(auth_mod, "saveUserData");

let requestHandlers: Record<string, RequestHandler>;

const validateUserMock = {
  data: {
    validateUser: {
      accessToken: "aaaaaaa",
      refreshToken: "zzzzzzz",
      user: {
        id: "123",
        email: "truc@machin.com",
        role: "USER",
      },
    },
  },
};

const generateWrapper = (moderate: boolean = false) => {
  const mockClient = createMockClient();
  const validate_user = {
    ...validateUserMock,
  };
  if (moderate) {
    validate_user.data.validateUser.user.role = "PENDING";
  }
  requestHandlers = {
    validateUserHandler: vi.fn().mockResolvedValue(validateUserMock),
    updateUserHandler: vi.fn().mockResolvedValue(nullMock),
  };

  mockClient.setRequestHandler(
    VALIDATE_USER,
    requestHandlers.validateUserHandler
  );
  mockClient.setRequestHandler(
    UPDATE_CURRENT_USER_CLIENT,
    requestHandlers.updateUserHandler
  );

  const wrapper = mount(ValidateUser, {
    props: {
      token: "123456789",
    },
    global: {
      stubs: ["router-link", "router-view"],
      provide: {
        [DefaultApolloClient]: mockClient,
      },
    },
  });
  wrapper.router.push.mockReset();
  return wrapper;
};

describe("Validate user page", () => {
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

  it("simple", async () => {
    const wrapper = generateWrapper();
    expect(wrapper.router).toBe(router);
    await flushPromises();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toMatchSnapshot();
    expect(requestHandlers.validateUserHandler).toBeCalledTimes(1);
    expect(requestHandlers.validateUserHandler).toHaveBeenCalledWith({
      token: "123456789",
    });
    // expect(wrapper.router.replace).toHaveBeenCalledWith({
    //   name: RouteName.CREATE_IDENTITY,
    // });
    // expect(requestHandlers.updateUserHandler).toBeCalledTimes(1);
  });

  it("moderate", async () => {
    const wrapper = generateWrapper(true);
    expect(wrapper.router).toBe(router);
    await flushPromises();
    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toMatchSnapshot();
    expect(requestHandlers.validateUserHandler).toBeCalledTimes(1);
    expect(requestHandlers.validateUserHandler).toHaveBeenCalledWith({
      token: "123456789",
    });
    expect(requestHandlers.updateUserHandler).toBeCalledTimes(0);
  });
});
