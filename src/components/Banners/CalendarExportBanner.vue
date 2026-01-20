<template>
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
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { onMounted } from "vue";

const { t } = useI18n({ useScope: "global" });

onMounted(() => {
  window.onresize = () => isMobile.value = window.innerWidth < 760;
});

const isMobile = ref(window.innerWidth < 760);
</script>
