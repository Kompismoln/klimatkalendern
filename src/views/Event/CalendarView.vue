<template>
  <div class="container mx-auto px-1 mb-6">
    <h1 v-if="!isMobile">
      {{ t("Calendar") }}
    </h1>

    <div class="mbz-card mb-4 overflow-hidden dark:border-gray-700 shadow-md dark:bg-mbz-purple md:flex">
      <img class="w-full md:max-w-80 md:pr-3 hidden md:block" src="/img/klimatkalendern-city.jpg" alt="">
      <div class="p-4 pb-6 flex flex-col items-start gap-3">
        <h2 class="font-extrabold">
          {{ t("Exporting events") }}
        </h2>
        <p>
          {{ t( "Press this button to export evenets to your calendar app. "+
          "You can choose which municipalities to include, "+
          "and when new events are posted you will receive updates."
          ) }}
        </p>
        <o-button
          tag="a"
          href="https://klimatkalendern.vercel.app/"
          iconLeft="Calendar"
          iconRight="OpenInNew"
          class="!h-auto"
          target="_blank"
          rel="noopener noreferer"
        >
          {{ t(isMobile ? "Export events" : "Export events to your calendar") }}
        </o-button>
      </div>
    </div>

    <div class="p-2">
      <EventsCalendar v-if="!isMobile" />
      <EventsAgenda v-else />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
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

  window.onresize = () => isMobile.value = window.innerWidth < 760;
});

const { t } = useI18n({ useScope: "global" });

const isMobile = ref(window.innerWidth < 760);
</script>
