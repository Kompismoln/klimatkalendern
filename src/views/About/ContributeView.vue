<template>
  <div class="container mx-auto px-2">
    <h1>{{ t("Contribute") }}</h1>
    <div class="prose dark:prose-invert">
      <p>
        Klimatkalendern används och älskas av den svenska klimatrörelsen, men än finns det mycket att förbättra! Skulle du vilja hjälpa oss i detta arbete? Vi letar just nu efter någon som vill gå med i vårt team. Allt vi gör är på ideell basis, men vi hjälper dig gärna komma igång.
      </p>
      <p>
        Klimatkalendern är byggd ovanpå den federerade sociala plattformen Mobilizon. Besök deras webbsida för att lära dig mer om deras techstack som inkluderar Elixir, Phoenix, och VueJS. Vi gör mest kosmetiska ändringar, och lägger endast till ny funktionalitet där det är nödvändigt.
	<a href="https://docs.mobilizon.org/about/">
          Länk till Mobilizons webbsida
	</a>
      </p>
      <p>
        Om du är det minsta intresserad av att hjälpa till med Klimatkalendern, hör av dig till info@klimatkalendern.nu så tar vi det därifrån!
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useQuery } from "@vue/apollo-composable";
import { useHead } from "@/utils/head";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { ABOUT } from "../../graphql/config";
import { IConfig } from "../../types/config.model";

const { t } = useI18n({ useScope: "global" });

useHead({
  title: t("Contribute"),
});
</script>

<style lang="scss" scoped>
:deep(dt) {
  font-weight: bold;
}
</style>
