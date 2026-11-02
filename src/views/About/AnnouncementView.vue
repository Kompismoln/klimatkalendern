<template>
  <div class="container mx-auto px-2">
    <div
      v-html="announcement"
      v-if="announcement"
    />
    <p v-else>{{ t("No announcement right now.") }}</p>
  </div>
</template>

<script lang="ts" setup>
import { useQuery } from "@vue/apollo-composable";
import { useHead } from "@/utils/head";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { ABOUT } from "../../graphql/config";
import { IConfig } from "../../types/config.model";
import gql from 'graphql-tag'

const { result: configResult } = useQuery<{ config: IConfig }>(ABOUT);

const config = computed(() => configResult.value?.config);

const { result: announcementResult } = useQuery(gql`query AdminSettings {
    adminSettings {
      instanceAnnouncementBody
    }
}`);

const announcement = computed(() => announcementResult.value?.adminSettings.instanceAnnouncementBody)

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
