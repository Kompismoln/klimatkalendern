<template>
  <footer
    class="bg-green-900 color-secondary flex flex-col items-center py-3 px-3"
    ref="footer"
  >
    <ul
      class="inline-flex flex-wrap justify-around gap-3 text-lg text-white underline decoration-yellow-1"
    >
      <li>
        <o-select
          class="text-black dark:text-white"
          :aria-label="t('Language')"
          v-model="locale"
          :placeholder="t('Select a language')"
        >
          <option
            v-for="(language, lang) in langs"
            :value="lang"
            :key="lang"
            :selected="isLangSelected(lang)"
          >
            {{ language }}
          </option>
        </o-select>
      </li>
      <li>
        <router-link :to="{ name: RouteName.ABOUT }">{{
          t("About")
        }}</router-link>
      </li>
      <li>
        <router-link :to="{ name: RouteName.TERMS }">{{
          t("Terms")
        }}</router-link>
      </li>
      <li>
        <a
          rel="external"
          hreflang="en"
          href="https://framagit.org/framasoft/mobilizon/blob/main/LICENSE"
        >
          {{ t("License") }}
        </a>
      </li>
      <li>
        <a href="#navbar">{{ t("Back to top") }}</a>
      </li>
    </ul>
  </footer>
</template>
<script setup lang="ts">
import { saveLocaleData } from "@/utils/auth";
import { loadLanguageAsync } from "@/utils/i18n";
import RouteName from "../router/name";
import langs from "../i18n/langs.json";
import { watch } from "vue";
import { useI18n } from "vue-i18n";

const { locale, t } = useI18n({ useScope: "global" });

watch(locale, async () => {
  if (locale) {
    console.debug("Setting locale from footer");
    await loadLanguageAsync(locale.value as string);
    saveLocaleData(locale.value as string);
  }
});

const isLangSelected = (lang: string): boolean => {
  return lang === locale.value;
};
</script>

<style lang="scss">
footer > ul > li {
  margin: auto 0;
}
</style>
