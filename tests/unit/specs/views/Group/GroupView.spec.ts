import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { getMockClient, requestHandlers } from "../../mocks/client";
import { htmlRemoveId } from "../../common";
import GroupView from "@/views/Group/GroupView.vue";
import { FETCH_GROUP_PUBLIC } from "@/graphql/group";
import { JOIN_GROUP } from "@/graphql/member";
import {
  GROUP_MEMBERSHIP_SUBSCRIPTION_CHANGED,
  PERSON_STATUS_GROUP,
} from "@/graphql/actor";
import {
  FOLLOW_GROUP,
  UNFOLLOW_GROUP,
  UPDATE_GROUP_FOLLOW,
} from "@/graphql/followers";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const generateWrapper = () => {
  const global_data = getMockClient([
    FETCH_GROUP_PUBLIC,
    JOIN_GROUP,
    GROUP_MEMBERSHIP_SUBSCRIPTION_CHANGED,
    PERSON_STATUS_GROUP,
    FOLLOW_GROUP,
    UNFOLLOW_GROUP,
    UPDATE_GROUP_FOLLOW,
  ]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(GroupView, {
    props: {
      preferredUsername: "my-group",
    },
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("GroupView", () => {
  it("Show simple", async () => {
    const wrapper = generateWrapper();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(1);
    expect(requestHandlers.handle_1).toHaveBeenCalledTimes(0);
    expect(requestHandlers.handle_2).toHaveBeenCalledTimes(0);
    expect(requestHandlers.handle_3).toHaveBeenCalledTimes(0);
    expect(requestHandlers.handle_4).toHaveBeenCalledTimes(0);
    expect(requestHandlers.handle_5).toHaveBeenCalledTimes(0);
    expect(requestHandlers.handle_6).toHaveBeenCalledTimes(0);
    expect(requestHandlers.handle_0).toHaveBeenCalledWith({
      name: "my-group",
      afterDateTime: new Date("2022-02-02T02:04:00.000Z"),
    });
  });
});
