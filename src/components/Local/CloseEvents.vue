<template>
  <close-content
    class="container mx-auto px-2"
    :suggestGeoloc="false"
    v-on="attrs"
  >
    <template #title>
      <template v-if="userLocation?.name">
        {{
          t("Incoming events nearby {position}", {
            position: userLocation?.name,
          })
        }}
      </template>
      <template v-else>
        {{ t("Incoming events") }}
      </template>
    </template>
    <template #subtitle>
      <div v-if="!loading && events.total == 0">
        <template v-if="userLocation?.name">
          {{
            t(
              "No events found nearby {position}. Try removing your position to see all events!",
              { position: userLocation?.name }
            )
          }}
        </template>
        <template v-else>
          {{ t("No events found") }}
        </template>
      </div>
    </template>
    <template #content>
      <skeleton-event-result
        v-for="i in 6"
        class="scroll-ml-6 snap-center shrink-0 w-[18rem] my-4"
        :key="i"
        v-show="loading"
      />
      <span v-for="event in events.elements" :key="event.elem.uuid">
        <more-content v-if="event.showActorMore" :to="event.actorMoreRoute">
          {{ t("View more events and activities from ") + event.actorMoreName }}
        </more-content>
        <event-card v-else :event="event.elem" :key="event.elem.uuid" />
      </span>
      <more-content
        v-if="userLocation?.name && userLocation?.lat && userLocation?.lon"
        :to="{
          name: RouteName.SEARCH,
          query: {
            locationName: userLocation?.name,
            lat: userLocation.lat?.toString(),
            lon: userLocation.lon?.toString(),
            contentType: 'ALL',
            distance: `${distance}_km`,
          },
        }"
        :picture="userLocation?.picture"
      >
        {{
          t("View more events and activities around {position}", {
            position: userLocation?.name,
          })
        }}
      </more-content>
      <more-content
        v-else
        :to="{
          name: RouteName.SEARCH,
          query: {
            contentType: 'ALL',
          },
        }"
      >
        {{ t("View more events and activities") }}
      </more-content>
    </template>
  </close-content>
</template>

<script lang="ts" setup>
import { LocationType } from "../../types/user-location.model";
import MoreContent from "./MoreContent.vue";
import CloseContent from "./CloseContent.vue";
import { watch, computed, useAttrs } from "vue";
import { FETCH_EVENTS } from "@/graphql/event";
import { IEvent } from "@/types/event.model";
import { useQuery } from "@vue/apollo-composable";
import EventCard from "../Event/EventCard.vue";
import { Paginate } from "@/types/paginate";
import SkeletonEventResult from "../Event/SkeletonEventResult.vue";
import { useI18n } from "vue-i18n";
import { coordsToGeoHash } from "@/utils/location";
import RouteName from "@/router/name";
import { EventSortField, SortDirection } from "@/types/enums";

const props = defineProps<{
  userLocation: LocationType;
  doingGeoloc?: boolean;
  distance: number | null;
}>();
defineEmits(["doGeoLoc"]);

const { t } = useI18n({ useScope: "global" });
const attrs = useAttrs();

const userLocation = computed(() => props.userLocation);

const geoHash = computed(() => {
  console.debug("userLocation updated", userLocation.value);
  const geo = coordsToGeoHash(userLocation.value.lat, userLocation.value.lon);
  console.debug("geohash:", geo);
  return geo;
});

const distance = computed<number>(() => {
  return props.distance | 25;
});

const eventsQuery = useQuery<{
  searchEvents: Paginate<IEvent>;
}>(FETCH_EVENTS, () => ({
  orderBy: EventSortField.BEGINS_ON,
  direction: SortDirection.ASC,
  longEvents: false,
  location: geoHash.value ?? "",
  radius: distance.value,
  limit: 93,
}));

const filterTooMany = ({ elements, total }) => {
  // Max events to show from one organizer
  const threshold = 2;
  const actorsCount = {};
  const actorsLast = {};
  const addActor = (id) => {
    if (!(id in actorsCount)) {
      actorsCount[id] = 0;
    }
    actorsCount[id]++;
  };
  const ret = [];
  for (const elem of elements) {
    const id = elem.attributedTo
      ? "grp-" + elem.attributedTo.id
      : "per-" + elem.organizerActor.id;
    addActor(id);

    if (actorsCount[id] <= threshold) {
      ret.push({ elem });
      actorsLast[id] = ret.length;
    } else if (actorsCount[id] == threshold + 1) {
      ret.splice(actorsLast[id], 0, {
        elem,
        showActorMore: true,
        actorMoreName: elem.attributedTo
          ? elem.attributedTo.name
          : elem.organizerActor.name,
        actorMoreRoute: elem.attributedTo
          ? "@" + elem.attributedTo.preferredUsername + "/events"
          : "/search",
      });
    }
  }
  return { elements: ret, total };
};

const events = computed(() =>
  filterTooMany(eventsQuery.result.value?.events ?? { elements: [], total: 0 })
);
watch(events, (e) => console.debug("events: ", e));

const loading = computed(() => props.doingGeoloc || eventsQuery.loading.value);
watch(loading, (l) => console.debug("loading: ", l));
</script>
