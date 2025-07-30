<template>
  <div
    class="datetime-container flex flex-col rounded-lg text-center justify-center overflow-hidden items-stretch bg-white dark:bg-gray-700 text-black dark:text-white"
    :class="{ small }"
    :style="`--small: ${smallStyle}`"
  >
    <div class="datetime-container-header bg-red-400 dark:bg-red-900">
      <time :datetime="dateObj.toISOString()" class="weekday">{{
        weekday
      }}</time>
    </div>
    <div class="datetime-container-content">
      <time :datetime="dateObj.toISOString()" class="day block font-semibold">{{
        day
      }}</time>
      <time
        :datetime="dateObj.toISOString()"
        class="month font-semibold block uppercase py-1 px-0"
        >{{ month }}</time
      >
    </div>
    <div class="datetime-container-footer bg-red-400 dark:bg-red-900">
      <time :datetime="dateObj.toISOString()" class="year">{{ year }}</time>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { locale } = useI18n({ useScope: "global" });

const localeConverted = computed(() => locale.value.replace("_", "-"));

const props = withDefaults(
  defineProps<{
    date: string;
    small?: boolean;
  }>(),
  { small: false }
);

const dateObj = computed<Date>(() => new Date(props.date));

const month = computed<string>(() =>
  dateObj.value.toLocaleString(localeConverted.value, { month: "short" })
);

const day = computed<string>(() =>
  dateObj.value.toLocaleString(localeConverted.value, { day: "numeric" })
);

const weekday = computed<string>(() =>
  dateObj.value.toLocaleString(localeConverted.value, { weekday: "short" })
);

const year = computed<string>(() =>
  dateObj.value.toLocaleString(localeConverted.value, { year: "numeric" })
);

const smallStyle = computed<string>(() => (props.small ? "1.2" : "2"));
</script>

<style lang="scss" scoped>
div.datetime-container {
  width: calc(40px * var(--small));
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
  height: calc(40px * var(--small));

  .datetime-container-header {
    height: calc(10px * var(--small));
  }
  .datetime-container-header .weekday {
    font-size: calc(9px * var(--small));
    font-weight: bold;
    vertical-align: top;
    line-height: calc(8px * var(--small));
  }
  .datetime-container-content {
    height: calc(22px * var(--small));
  }
  .datetime-container-footer {
    height: calc(8px * var(--small));
  }
  .datetime-container-footer .year {
    font-size: calc(7px * var(--small));
    font-weight: bold;
    vertical-align: top;
    line-height: calc(8px * var(--small));
  }

  time {
    &.month {
      font-size: 10px;
      line-height: 9px;
    }

    &.day {
      font-size: calc(0.8rem * var(--small));
      line-height: calc(0.7rem * var(--small));
    }
  }
}
</style>
