import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { getMockClient, requestHandlers } from "../../mocks/client";
import InstancesView from "@/views/Admin/InstancesView.vue";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { ADD_INSTANCE, INSTANCES } from "@/graphql/admin";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const instances_mock = {
  data: {
    instances: {
      __typename: "PaginatedInstanceList",
      elements: [
        {
          __typename: "Instance",
          domain: "mobilizon.test",
          eventCount: 20,
          followedStatus: "NONE",
          followerStatus: "NONE",
          followersCount: 0,
          followingsCount: 0,
          groupCount: 1,
          hasRelay: true,
          instanceDescription: "Mobilizon for test.",
          instanceName: "Mobilizon",
          mediaSize: 2951695,
          personCount: 5,
          relayAddress: "relay@mobilizon.test",
          reportsCount: 1,
          software: "Mobilizon",
          softwareVersion: "5.1.5",
        },
        {
          __typename: "Instance",
          domain: "agenda.test",
          eventCount: 4,
          followedStatus: "APPROVED",
          followerStatus: "NONE",
          followersCount: 0,
          followingsCount: 12,
          groupCount: 0,
          hasRelay: true,
          instanceDescription: "agenda gancio",
          instanceName: "Agenda de Crémeaux",
          mediaSize: 3774456,
          personCount: 0,
          relayAddress: "events@agenda.test",
          reportsCount: 0,
          software: "gancio",
          softwareVersion: "1.27.0",
        },
      ],
      total: 2,
    },
  },
};

const generateWrapper = (mock_instances = {}) => {
  const global_data = getMockClient([
    ADD_INSTANCE,
    [INSTANCES, mock_instances],
  ]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(InstancesView, {
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("InstancesView", () => {
  it("Show simple", async () => {
    const wrapper = generateWrapper(instances_mock);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.html()).toMatchSnapshot();
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(0);
    expect(requestHandlers.handle_1).toHaveBeenCalledTimes(1);
    expect(requestHandlers.handle_1).toHaveBeenCalledWith({
      filterDomain: "",
      filterFollowStatus: "ALL",
      limit: 10,
      page: 1,
    });
  });
});
