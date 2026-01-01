<template>
  <div class="container mx-auto px-1 mb-6">
    <h1 v-if="!isMobile">
      {{ t("Calendar") }}
    </h1>

    <h2>
	    {{ t("Exporting events") }}
    </h2>
    <p>
		    {{ t( "Press this button to export evenets to your calendar app. "+
		    "You can choose which municipalities to include, "+
		    "and when new events are posted you will receive updates."
		    ) }}
		    <br />
	    <a href="https://klimatkalendern.vercel.app/">
		    <o-button>
		    {{ t("Export events to your calendar") }}
		    </o-button>
	    </a>
    </p>

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
