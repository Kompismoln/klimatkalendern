import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { getMockClient } from "../../mocks/client";
import { htmlRemoveId } from "../../common";
import ProfileOnboarding from "@/components/Account/ProfileOnboarding.vue";
import { ActorType } from "@/types/enums";
import { IPerson } from "@/types/actor";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const baseActor: IPerson = {
  name: "Thomas Citharel",
  preferredUsername: "tcit",
  avatar: null,
  domain: null,
  url: "",
  summary: "",
  suspended: false,
  type: ActorType.PERSON,
};

const generateWrapper = (props: any) => {
  const global_data = getMockClient([]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(ProfileOnboarding, {
    props: props,
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("ProfileOnboarding", () => {
  it("Show simple", async () => {
    const wrapper = generateWrapper({
      currentActor: baseActor,
      instanceName: "Instance name",
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });
});
