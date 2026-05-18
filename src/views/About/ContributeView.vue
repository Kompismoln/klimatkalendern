<template>
  <div class="container mx-auto px-2">
    <h1>{{ t("Contribute") }}</h1>
    <div class="prose dark:prose-invert" v-if="config">
      <p>
        {{
          t(
	  "Klimatkalendern is used and loved by the Swedish climate movement, but there are still some rough edges to iron out. Would you like to be part of our work? We are currently looking for someone to join our team. All we do is on a volunteer basis, but we are happy to guide you on board."
          )
        }}
      </p>
      <p>
        {{
          t(
	  "Klimatkalendern is built on top of the federated social platform Mobilizon. Head over to their website to find out about the Elixir, Phoenix, and VueJS tech stack. We mostly make cosmetic changes, and add features only when there is no good way around it."
          ) 
        }}
	<a href="https://docs.mobilizon.org/about/">
	  {{
	    t(
	    "Link to mobilizon's website"
	    )
    	  }}
	</a>
      </p>
      <p>
        {{
          t(
	  "If you're interested in contributing to klimatkalendern, please email info@klimatkalendern.nu and we'll take it from there!"
          )
        }}
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

const { result: configResult } = useQuery<{ config: IConfig }>(ABOUT);

const config = computed(() => configResult.value?.config);

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
