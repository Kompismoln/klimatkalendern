import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { getMockClient, requestHandlers } from "../../mocks/client";
import { htmlRemoveId } from "../../common";
import OrganizerPickerWrapper from "@/components/Event/OrganizerPickerWrapper.vue";
import { PERSON_GROUP_MEMBERSHIPS } from "@/graphql/actor";
import { IDENTITIES } from "@/graphql/actor";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const mock_person = {
  data: {
    person: { id: "5", memberships: { total: 0, elements: [] } },
  },
};
const mock_loggeduser = {
  data: {
    loggedUser: {
      actors: [{ id: "9", preferredUsername: "sam", name: "Samuel" }],
    },
  },
};

const generateWrapper = () => {
  const global_data = getMockClient([
    [PERSON_GROUP_MEMBERSHIPS, mock_person],
    [IDENTITIES, mock_loggeduser],
  ]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(OrganizerPickerWrapper, {
    props: {
      modelValue: {
        id: "5",
        preferredUsername: "hello",
        name: "Sigmund",
      },
    },
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("OrganizerPickerWrapper", () => {
  it("Show simple", async () => {
    const wrapper = generateWrapper();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(0);
    expect(requestHandlers.handle_1).toHaveBeenCalledTimes(0);
  });
});
