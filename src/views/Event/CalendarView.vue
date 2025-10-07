<template>
  <div class="container mx-auto px-1 mb-6">
    <h1 v-if="!isMobile">
      {{ t("Calendar") }}
    </h1>

    <div class="p-2">
      <EventsCalendar v-if="!isMobile" />
      <EventsAgenda v-else />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import EventsAgenda from "@/components/FullCalendar/EventsAgenda.vue";
import EventsCalendar from "@/components/FullCalendar/EventsCalendar.vue";
import { onMounted } from "vue";
import { getElementByXPath } from "@/utils/html";

onMounted(() => {
  const icon_left = getElementByXPath(
    "//span[contains(@class,'fc-icon-chevron-left')]"
  );
  icon_left.setAttribute("aria-label", t("Previous"));
  const icon_right = getElementByXPath(
    "//span[contains(@class,'fc-icon-chevron-right')]"
  );
  icon_right.setAttribute("aria-label", t("Next"));
});

const { t } = useI18n({ useScope: "global" });

const isMobile = window.innerWidth < 760;
</script>
