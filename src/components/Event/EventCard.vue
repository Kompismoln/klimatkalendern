<template>
  <LinkOrRouterLink
    class="mbz-card snap-center dark:bg-mbz-purple"
    :class="{
      'sm:flex sm:items-start': mode === 'row',
      'sm:max-w-xs w-[18rem] shrink-0 flex flex-col': mode === 'column',
    }"
    :to="to"
    :isInternal="isInternal"
  >
    <div
      class="rounded-lg"
      :class="{ 'sm:w-full sm:max-w-[20rem]': mode === 'row' }"
    >
      <div
        class="-mt-3 h-0 mb-3 ltr:ml-0 rtl:mr-0 block relative z-10 hidden"
        :class="{
          'sm:hidden': mode === 'row',
          'calendar-simple': !isDifferentBeginsEndsDate,
          'calendar-double': isDifferentBeginsEndsDate,
        }"
      >
        <date-calendar-icon
          :small="true"
          v-if="!mergedOptions.hideDate"
          :date="event.beginsOn.toString()"
        />
        <MenuDown
          :small="true"
          class="left-3 relative"
          v-if="!mergedOptions.hideDate && isDifferentBeginsEndsDate"
        />
        <date-calendar-icon
          :small="true"
          v-if="!mergedOptions.hideDate && isDifferentBeginsEndsDate"
          :date="event.endsOn?.toString()"
        />
      </div>

      <figure class="block relative pt-40">
        <lazy-image-wrapper
          :picture="event.picture"
          style="height: 100%; position: absolute; top: 0; left: 0; width: 100%"
        />
        <div
          class="absolute top-3 right-0 ltr:-mr-1 rtl:-ml-1 z-10 max-w-xs no-underline flex flex-col gap-1 items-end"
          v-show="mode === 'column'"
          v-if="event.tags || event.status !== EventStatus.CONFIRMED"
        >
          <mobilizon-tag
            variant="info"
            v-if="event.status === EventStatus.TENTATIVE"
          >
            {{ t("Tentative") }}
          </mobilizon-tag>
          <mobilizon-tag
            variant="danger"
            v-if="event.status === EventStatus.CANCELLED"
          >
            {{ t("Cancelled") }}
          </mobilizon-tag>
          <router-link
            :to="{ name: RouteName.TAG, params: { tag: tag.title } }"
            v-for="tag in (event.tags || []).slice(0, 3)"
            :key="tag.slug"
          >
            <mobilizon-tag dir="auto" :with-hash-tag="true">{{
              tag.title
            }}</mobilizon-tag>
          </router-link>
        </div>
      </figure>
    </div>
    <div class="p-2 flex-auto" :class="{ 'sm:flex-1': mode === 'row' }">
      <div class="relative flex flex-col h-full">
        <div
          class="-mt-3 h-0 flex mb-3 ltr:ml-0 rtl:mr-0 items-end self-end"
          :class="{ 'sm:hidden': mode === 'row' }"
        >
          <start-time-icon
            class="hidden"
            :small="true"
            v-if="!mergedOptions.hideDate && event.options.showStartTime"
            :date="event.beginsOn.toString()"
            :timezone="event.options.timezone"
          />
        </div>
        <div class="w-full flex flex-col justify-between h-full">
          <h2
            class="mt-0 mb-2 text-2xl line-clamp-3 font-bold text-violet-3 dark:text-white"
            dir="auto"
            :lang="event.language"
          >
            {{ event.title }}
          </h2>
          <span
            class="text-gray-700 dark:text-white font-semibold"
            :class="{ 'sm:block': mode === 'row' }"
            >{{ formatedDate }}
          </span>
          <div class="">
            <div
              class="flex items-center text-violet-3 dark:text-white"
              dir="auto"
            >
              <figure class="" v-if="actorAvatarURL">
                <img
                  class="rounded-xl"
                  :src="actorAvatarURL"
                  alt=""
                  width="24"
                  height="24"
                  loading="lazy"
                />
              </figure>
              <account-circle v-else />
              <span class="font-semibold ltr:pl-2 rtl:pr-2">
                {{ organizerDisplayName(event) }}
              </span>
            </div>
            <inline-address
              v-if="event.physicalAddress"
              :physical-address="event.physicalAddress"
            />
            <div
              class="flex items-center text-sm"
              dir="auto"
              v-else-if="event.options && event.options.isOnline"
            >
              <Video />
              <span class="ltr:pl-2 rtl:pr-2">{{ t("Online") }}</span>
            </div>
            <div
              class="mt-1 no-underline gap-1 items-center hidden"
              :class="{ 'sm:flex': mode === 'row' }"
              v-if="
                event.tags ||
                event.status !== EventStatus.CONFIRMED ||
                event.participantStats?.participant > 0
              "
            >
              <mobilizon-tag
                variant="info"
                v-if="event.participantStats?.participant > 0"
              >
                {{
                  t(
                    "{count} participants",
                    { count: event.participantStats?.participant },
                    event.participantStats?.participant
                  )
                }}
              </mobilizon-tag>
              <mobilizon-tag
                variant="info"
                v-if="event.status === EventStatus.TENTATIVE"
              >
                {{ t("Tentative") }}
              </mobilizon-tag>
              <mobilizon-tag
                variant="danger"
                v-if="event.status === EventStatus.CANCELLED"
              >
                {{ t("Cancelled") }}
              </mobilizon-tag>
              <router-link
                :to="{ name: RouteName.TAG, params: { tag: tag.title } }"
                v-for="tag in (event.tags || []).slice(0, 3)"
                :key="tag.slug"
              >
                <mobilizon-tag :with-hash-tag="true" dir="auto">{{
                  tag.title
                }}</mobilizon-tag>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </LinkOrRouterLink>
</template>
<style scoped>
.calendar-simple {
  bottom: -117px;
  left: 5px;
}
.calendar-double {
  bottom: -45px;
  left: 5px;
}
</style>

<script lang="ts" setup>
import {
  IEvent,
  IEventCardOptions,
  organizerDisplayName,
  organizerAvatarUrl,
} from "@/types/event.model";
import DateCalendarIcon from "@/components/Event/DateCalendarIcon.vue";
import StartTimeIcon from "@/components/Event/StartTimeIcon.vue";
import MenuDown from "vue-material-design-icons/MenuDown.vue";
import LazyImageWrapper from "@/components/Image/LazyImageWrapper.vue";
import { EventStatus } from "@/types/enums";
import RouteName from "../../router/name";
import InlineAddress from "@/components/Address/InlineAddress.vue";

import { computed, inject } from "vue";
import MobilizonTag from "@/components/TagElement.vue";
import AccountCircle from "vue-material-design-icons/AccountCircle.vue";
import Video from "vue-material-design-icons/Video.vue";
import * as dtutils from "@/utils/datetime";
import type { Locale } from "date-fns";
import LinkOrRouterLink from "../core/LinkOrRouterLink.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });

const props = withDefaults(
  defineProps<{
    event: IEvent;
    options?: IEventCardOptions;
    mode?: "row" | "column";
  }>(),
  { mode: "column" }
);
const defaultOptions: IEventCardOptions = {
  hideDate: false,
  loggedPerson: false,
  hideDetails: false,
  organizerActor: null,
  isRemoteEvent: false,
  isLoggedIn: true,
};

const mergedOptions = computed<IEventCardOptions>(() => ({
  ...defaultOptions,
  ...props.options,
}));

// const actor = computed<Actor>(() => {
//   return Object.assign(
//     new Person(),
//     props.event.organizerActor ?? mergedOptions.value.organizerActor
//   );
// });

const actorAvatarURL = computed<string | null>(() =>
  organizerAvatarUrl(props.event)
);

const dateFnsLocale = inject<Locale>("dateFnsLocale");

const isDifferentBeginsEndsDate = computed(() => {
  if (!dateFnsLocale) return;
  const beginsOnStr = dtutils.formatDateForEvent(
    new Date(props.event.beginsOn),
    dateFnsLocale
  );
  const endsOnStr = props.event.endsOn
    ? dtutils.formatDateForEvent(new Date(props.event.endsOn), dateFnsLocale)
    : null;
  return endsOnStr && endsOnStr != beginsOnStr;
});

const isInternal = computed(() => {
  return (
    mergedOptions.value.isRemoteEvent &&
    mergedOptions.value.isLoggedIn === false
  );
});

const to = computed(() => {
  if (mergedOptions.value.isRemoteEvent) {
    if (mergedOptions.value.isLoggedIn === false) {
      return props.event.url;
    }
    return {
      name: RouteName.INTERACT,
      query: { uri: encodeURI(props.event.url) },
    };
  }
  return { name: RouteName.EVENT, params: { uuid: props.event.uuid } };
});

/*
  Date formatting.

  In the event card we want datetimes to be nicely formatted. The `formatedDate` contains whatever text
  is to be displayed for that purpouse. The formatting is along the lines of
    https://github.com/Kompismoln/klimatkalendern/issues/25
  
  TL;DR When the locale is sv we use custom formatting logic to have the date be super spick and span.
  If the locale is something else we use generic l11n to make the datetime string.
*/

const formatedDate = computed(() => formatDate(props.event));

function formatDate(event: IEvent) {
  if (dateFnsLocale?.code === "sv") {
    return formatDateSv(event);
  }
  return formateDateGeneric(event);
}

function formateDateGeneric(event: IEvent) {
  if (!dateFnsLocale) {
    console.error("Locale is undefined");
    return;
  }

  const b = new Date(event.beginsOn);
  const e = new Date(event.endsOn ?? b); // TODO: How can an event no have an end date?

  // Single day event
  if (
    b.getFullYear() == e.getFullYear() &&
    b.getMonth() == e.getMonth() &&
    b.getDate() == e.getDate()
  ) {
    // No time information
    if (!event.options.showStartTime) {
      return `🗓 ${dtutils.formatDateForEvent(b, dateFnsLocale)}`;
    }

    // With start time.
    if (event.options.showStartTime && !event.options.showEndTime) {
      return `🗓 ${dtutils.formatDateTimeForEvent(b, dateFnsLocale)}`;
    }

    // Start and end time.
    return `🗓 ${dtutils.formatTimeRangeForEvents(b, e, dateFnsLocale)}`;
  }

  // Multi day event
  return `🗓 ${dtutils.formatDateForEvent(new Date(props.event.beginsOn), dateFnsLocale)} – ${dtutils.formatDateForEvent(e, dateFnsLocale)}`;
}

function formatDateSv(event: IEvent) {
  const b = new Date(event.beginsOn);
  const e = new Date(event.endsOn ?? b); // TODO: How can an event no have an end date?

  const bWeekDay = dtutils.localeShortWeekDayNames(dateFnsLocale)[b.getDay()];
  const eWeekDay = dtutils.localeShortWeekDayNames(dateFnsLocale)[e.getDay()];

  // NOTE: We never write out which year the event occurs on,
  //       I imagine the cases where that's important are excidingly rare.

  // Single day event
  if (
    b.getFullYear() == e.getFullYear() &&
    b.getMonth() == e.getMonth() &&
    b.getDate() == e.getDate()
  ) {
    // No time information
    if (!event.options.showStartTime) {
      return `🗓 ${capitalize(bWeekDay)} ${b.getDate()} ${getMonthSv(b)}`;
    }

    // With start time.
    if (event.options.showStartTime && !event.options.showEndTime) {
      return `🗓 ${capitalize(bWeekDay)} ${b.getDate()} ${getMonthSv(b)} ${getTimeSv(b)}`;
    }

    // Start and end time.
    return `🗓 ${capitalize(bWeekDay)} ${b.getDate()} ${getMonthSv(b)} ${getTimeRangeSv(b, e)}`;
  }

  // Multi day event
  if (b.getFullYear() == e.getFullYear() && b.getMonth() == e.getMonth()) {
    return `🗓 ${capitalize(bWeekDay)} ${b.getDate()} – ${eWeekDay} ${e.getDate()} ${getMonthSv(b)} ${getTimeRangeSv(b, e)}`;
  }

  // NOTE: This code path is taken for events spanning different years to! But
  //       omitting year will not be confusing assuming events don't span many many monts
  //       or even many years.
  return `🗓 ${capitalize(bWeekDay)} ${b.getDate()} ${getMonthSv(e)} – ${eWeekDay} ${e.getDate()} ${getMonthSv(e)} ${getTimeRangeSv(b, e)}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getMonthSv(date: Date) {
  return [
    "jan",
    "feb",
    "mars",
    "apr",
    "maj",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ][date.getMonth()];
}

function getTimeRangeSv(fromTime: Date, toTime: Date) {
  // TODO: Display only one time if `from` and `to` are the same
  return `${getTimeSv(fromTime)}–${getTimeSv(toTime)}`;
}

function getTimeSv(date: Date) {
  if (date.getMinutes() === 0) {
    return `${date.getHours().toString().padStart(2, "0")}`;
  }
  return `${date.getHours().toString().padStart(2, "0")}.${date.getMinutes().toString().padStart(2, "0")}`;
}
</script>
