import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { getMockClient, requestHandlers } from "../../mocks/client";
import { htmlRemoveId } from "../../common";
import PopoverActorCard from "@/components/Account/PopoverActorCard.vue";
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

const baseActorAvatar = {
  id: "",
  name: "",
  alt: "",
  metadata: {},
  url: "https://social.tcit.fr/system/accounts/avatars/000/000/001/original/a28c50ce5f2b13fd.jpg",
};

const baseActor = {
  name: "Thomas Citharel",
  preferredUsername: "tcit",
  avatar: baseActorAvatar,
  domain: null,
  url: "",
  summary: "",
  suspended: false,
  type: ActorType.PERSON,
};

const group = {
  ...baseActor,
  name: "Framasoft",
  preferredUsername: "framasoft",
  domain: "mobilizon.fr",
  avatar: {
    ...baseActorAvatar,
    url: "https://stockage.framapiaf.org/framapiaf/accounts/avatars/000/000/399/original/52b08a3e80b43d40.jpg",
  },
};

const generateWrapper = (actor: any) => {
  const global_data = getMockClient([]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(PopoverActorCard, {
    props: {
      actor: actor,
    },
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
    slots: {
      default: "<div><b> Popover me !</b></div>",
    },
  });
};

describe("PopoverActorCard", () => {
  it("Show Person", async () => {
    const wrapper = generateWrapper(baseActor);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show Group", async () => {
    const wrapper = generateWrapper(group);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });
});
