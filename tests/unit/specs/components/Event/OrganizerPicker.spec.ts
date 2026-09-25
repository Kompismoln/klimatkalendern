import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { getMockClient } from "../../mocks/client";
import { htmlRemoveId } from "../../common";
import OrganizerPicker from "@/components/Event/OrganizerPicker.vue";
import { reactive, ref } from "vue";
import { ActorType } from "@/types/enums";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const currentActor = reactive({
  id: "59",
  preferredUsername: "me",
  name: "Someone",
  type: ActorType.PERSON,
});

const actor = reactive({
  id: "5",
  preferredUsername: "hello",
  name: "Sigmund",
  type: ActorType.PERSON,
});

const group = reactive({
  id: "89",
  preferredUsername: "congregation",
  name: "College",
  type: ActorType.GROUP,
});

const identities = [actor, group];

const generateWrapper = () => {
  const global_data = getMockClient([]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(OrganizerPicker, {
    props: {
      modelValue: actor,
      identities: identities,
      actorFilter: "",
      groupMemberships: [],
      currentActor: currentActor,
    },
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("OrganizerPicker", () => {
  it("Show simple", async () => {
    const wrapper = generateWrapper();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });
});
