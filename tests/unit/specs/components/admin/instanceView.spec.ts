import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import {
  ACCEPT_RELAY,
  ADD_INSTANCE,
  INSTANCE,
  REJECT_RELAY,
  REMOVE_RELAY,
} from "@/graphql/admin";
import { getMockClient, requestHandlers } from "../../mocks/client";
import InstanceView from "@/views/Admin/InstanceView.vue";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const instance_mock = {
  data: {
    instance: {
      __typename: "Instance",
      domain: "mobilizon.test",
      eventCount: 20,
      followedStatus: "NONE",
      followerStatus: "NONE",
      followersCount: 0,
      followingsCount: 0,
      groupCount: 1,
      hasRelay: true,
      instanceDescription: "Mobilizon for test",
      instanceName: "Mobilizon",
      mediaSize: 2951695,
      personCount: 5,
      relayAddress: "relay@mobilizon.test",
      reportsCount: 1,
      software: "Mobilizon",
      softwareVersion: "5.2.0",
    },
  },
};

const generateWrapper = (mock_instance = {}) => {
  const global_data = getMockClient([
    ACCEPT_RELAY,
    ADD_INSTANCE,
    [INSTANCE, mock_instance],
    REJECT_RELAY,
    REMOVE_RELAY,
  ]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(InstanceView, {
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("InstanceView", () => {
  it("Show simple", async () => {
    const wrapper = generateWrapper(instance_mock);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.html()).toMatchSnapshot();
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(0);
    expect(requestHandlers.handle_1).toHaveBeenCalledTimes(0);
    expect(requestHandlers.handle_2).toHaveBeenCalledTimes(1);
    expect(requestHandlers.handle_3).toHaveBeenCalledTimes(0);
    expect(requestHandlers.handle_4).toHaveBeenCalledTimes(0);
    expect(requestHandlers.handle_2).toHaveBeenCalledWith({});
  });
});
