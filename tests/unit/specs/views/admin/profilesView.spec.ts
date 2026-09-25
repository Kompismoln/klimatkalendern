import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { getMockClient, requestHandlers } from "../../mocks/client";
import ProfilesView from "@/views/Admin/ProfilesView.vue";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { LIST_PROFILES } from "@/graphql/actor";
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

const profiles_mock = {
  data: {
    persons: {
      __typename: "PaginatedPersonList",
      elements: [
        {
          __typename: "Person",
          avatar: null,
          domain: null,
          id: "1",
          name: "Mobilizon Anonymous Actor",
          preferredUsername: "anonymous",
          summary: "A fake person for anonymous participations",
          type: "PERSON",
          url: "https://mobilizion.test/@anonymous",
        },
        {
          __typename: "Person",
          avatar: null,
          domain: null,
          id: "2",
          name: "Mobilizon",
          preferredUsername: "mobilizon",
          summary: null,
          type: "PERSON",
          url: "https://mobilizion.test/@mobilizon",
        },
        {
          __typename: "Person",
          avatar: null,
          domain: null,
          id: "109687",
          name: "Example",
          preferredUsername: "example",
          summary: "Profile for example",
          type: "PERSON",
          url: "https://mobilizion.test/@example",
        },
      ],
      total: 3,
    },
  },
};

const generateWrapper = (mock_profiles = {}) => {
  const global_data = getMockClient([[LIST_PROFILES, mock_profiles]]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(ProfilesView, {
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("ProfilesView", () => {
  it("Show simple", async () => {
    const wrapper = generateWrapper(profiles_mock);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(1);
    expect(requestHandlers.handle_0).toHaveBeenCalledWith({
      domain: "",
      limit: 10,
      local: true,
      name: "",
      page: 1,
      preferredUsername: "",
      suspended: false,
    });
  });
});
