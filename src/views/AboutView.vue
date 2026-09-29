<template>
  <div>
    <section class="container mx-auto">
      <div class="flex flex-wrap gap-4">
        <aside class="w-64 mt-6">
          <div
            class="overflow-y-auto py-4 px-3 bg-gray-50 rounded dark:bg-gray-800"
          >
            <p>
              <router-link
                class="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                :to="{ name: RouteName.ABOUT_INSTANCE }"
                >{{ t("About this instance") }}</router-link
              >
            </p>
            <ul>
              <li>
                <router-link
                  class="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  :to="{ name: RouteName.TERMS }"
                  >{{ t("Terms of service") }}</router-link
                >
              </li>
              <li>
                <router-link
                  class="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  :to="{ name: RouteName.PRIVACY }"
                  >{{ t("Privacy policy") }}</router-link
                >
              </li>
              <li>
                <router-link
                  class="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  :to="{ name: RouteName.RULES }"
                  >{{ t("Instance rules") }}</router-link
                >
              </li>
              <li>
                <router-link
                  class="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  :to="{ name: RouteName.GLOSSARY }"
                  >{{ t("Glossary") }}</router-link
                >
              </li>
              <li>
                <router-link
                  class="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  :to="{ name: RouteName.CONTRIBUTE }"
                  >{{ t("Contribute") }}</router-link
                >
              </li>
            </ul>
          </div>
        </aside>
        <div class="container mx-auto flex-1 bg-white dark:bg-gray-700">
          <router-view />
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { CONFIG } from "@/graphql/config";
import { IConfig } from "@/types/config.model";
import RouteName from "../router/name";
import { useQuery } from "@vue/apollo-composable";
import { computed } from "vue";
import { useCurrentUserClient } from "@/composition/apollo/user";
import { useI18n } from "vue-i18n";
import { useHead } from "@/utils/head";

const { currentUser } = useCurrentUserClient();

const { result: configResult } = useQuery<{ config: IConfig }>(CONFIG);

const config = computed(() => configResult.value?.config);

const { t } = useI18n({ useScope: "global" });

useHead({
  title: computed(() =>
    t("About {instance}", { instance: config.value?.name })
  ),
});

// metaInfo() {
//   return {
//     title: this.t("About {instance}", {
//       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//       // @ts-ignore
//       instance: this?.config?.name,
//     }) as string,
//   };
// },
</script>
