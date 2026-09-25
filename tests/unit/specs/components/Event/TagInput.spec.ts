import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { getMockClient, requestHandlers } from "../../mocks/client";
import { htmlRemoveId } from "../../common";
import TagInput from "@/components/Event/TagInput.vue";
import { FILTER_TAGS } from "@/graphql/tags";
import { ITag } from "@/types/tag.model";
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

const tags = reactive<ITag[]>([{ title: "Hello", slug: "hello" }]);

const generateWrapper = () => {
  const global_data = getMockClient([FILTER_TAGS]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(TagInput, {
    props: {
      modelValue: tags,
    },
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("TagInput", () => {
  it("Show new", async () => {
    const wrapper = generateWrapper();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(0);
  });
});
