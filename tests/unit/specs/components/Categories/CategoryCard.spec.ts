import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { getMockClient } from "../../mocks/client";
import { htmlRemoveId } from "../../common";
import CategoryCard from "@/components/Categories/CategoryCard.vue";
import { CategoryStatsModel } from "@/types/stats.model";
import { reactive } from "vue";

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
  return mount(CategoryCard, {
    props: props,
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

const category = reactive<CategoryStatsModel>({
  key: "PHOTOGRAPHY",
  number: 5,
  label: "Hello",
});

describe("CategoryCard", () => {
  it("Show Basic", async () => {
    const wrapper = generateWrapper({
      category: category,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show Details", async () => {
    const wrapper = generateWrapper({
      category: { ...category, key: "OUTDOORS_ADVENTURE" },
      withDetails: true,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });
});
