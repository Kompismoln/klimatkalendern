import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { getMockClient } from "../../mocks/client";
import { htmlRemoveId } from "../../common";
import ActorInline from "@/components/Account/ActorInline.vue";
import { reactive, ref } from "vue";
import { IActor } from "@/types/actor";
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

const generateWrapper = (props: any) => {
  const global_data = getMockClient([]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(ActorInline, {
    props: props,
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

const avatarUrl = ref<string>(
  "https://stockage.framapiaf.org/framapiaf/accounts/avatars/000/000/399/original/52b08a3e80b43d40.jpg"
);

const stateLocal = reactive<IActor>({
  name: "Thomas Citharel",
  preferredUsername: "tcit",
  avatar: null,
  domain: null,
  url: "",
  summary: "",
  suspended: false,
  type: ActorType.PERSON,
});

const stateRemote = reactive<IActor>({
  name: "Framasoft",
  preferredUsername: "framasoft",
  avatar: { url: avatarUrl.value, id: "", name: "", alt: "", metadata: {} },
  domain: "framapiaf.org",
  url: "",
  summary: "",
  suspended: false,
  type: ActorType.PERSON,
});

describe("ActorInline", () => {
  it("Show local", async () => {
    const wrapper = generateWrapper({
      actor: stateLocal,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show remote", async () => {
    const wrapper = generateWrapper({
      actor: stateRemote,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });
});
