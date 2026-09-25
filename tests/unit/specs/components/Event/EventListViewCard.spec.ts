import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { getMockClient } from "../../mocks/client";
import { htmlRemoveId } from "../../common";
import EventListViewCard from "@/components/Event/EventListViewCard.vue";
import { IActor } from "@/types/actor";
import {
  ActorType,
  CommentModeration,
  EventJoinOptions,
  EventStatus,
  EventVisibility,
} from "@/types/enums";
import { IEvent } from "@/types/event.model";
import { reactive } from "vue";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const generateWrapper = (props: any) => {
  const global_data = getMockClient([]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(EventListViewCard, {
    props: props,
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

const baseActorAvatar = {
  id: "",
  name: "",
  alt: "",
  metadata: {},
  url: "https://social.tcit.fr/system/accounts/avatars/000/000/001/original/a28c50ce5f2b13fd.jpg",
};

const baseActor: IActor = {
  name: "Thomas Citharel",
  preferredUsername: "tcit",
  avatar: baseActorAvatar,
  domain: null,
  url: "",
  summary: "",
  suspended: false,
  type: ActorType.PERSON,
};

const baseEvent: IEvent = {
  uuid: "0123456789",
  title: "A very interesting event",
  description: "Things happen",
  beginsOn: "2022-02-02T02:04:00.000Z",
  endsOn: "2022-02-04T02:04:00.000Z",
  physicalAddress: {
    description: "Somewhere",
    street: "",
    locality: "",
    region: "",
    country: "",
    type: "",
    postalCode: "",
  },
  picture: {
    id: "",
    name: "",
    alt: "",
    metadata: {},
    url: "https://mobilizon.fr/media/81d9c76aaf740f84eefb28cf2b9988bdd2495ab1f3246159fd688e242155cb23.png?name=Screenshot_20220315_171848.png",
  },
  url: "",
  local: true,
  slug: "",
  publishAt: "2022-02-02T02:04:00.000Z",
  status: EventStatus.CONFIRMED,
  visibility: EventVisibility.PUBLIC,
  joinOptions: EventJoinOptions.FREE,
  draft: false,
  participantStats: {
    notApproved: 0,
    notConfirmed: 0,
    rejected: 0,
    participant: 0,
    creator: 0,
    moderator: 0,
    administrator: 0,
    going: 0,
  },
  participants: { total: 0, elements: [] },
  relatedEvents: [],
  tags: [{ slug: "something", title: "Something" }],
  attributedTo: undefined,
  organizerActor: {
    ...baseActor,
    name: "Hello",
    avatar: {
      ...baseActorAvatar,
      url: "https://mobilizon.fr/media/653c2dcbb830636e0db975798163b85e038dfb7713e866e96d36bd411e105e3c.png?name=festivalsanantes%27s%20avatar.png",
    },
  },
  comments: [],
  options: {
    maximumAttendeeCapacity: 0,
    remainingAttendeeCapacity: 0,
    showRemainingAttendeeCapacity: false,
    anonymousParticipation: false,
    hideOrganizerWhenGroupEvent: false,
    offers: [],
    participationConditions: [],
    attendees: [],
    program: "",
    commentModeration: CommentModeration.ALLOW_ALL,
    showParticipationPrice: false,
    showStartTime: false,
    showEndTime: false,
    timezone: null,
    isOnline: false,
  },
  metadata: [],
  contacts: [],
  language: "en",
  category: "hello",
};

const longEvent = reactive<IEvent>({
  ...baseEvent,
  title:
    "A very long title that will have trouble to display because it will take multiple lines but where will it stop ?! Maybe after 3 lines is enough. Let's say so.",
});

describe("EventListViewCard", () => {
  it("Show default", async () => {
    const wrapper = generateWrapper({
      event: baseEvent,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show long", async () => {
    const wrapper = generateWrapper({
      event: longEvent,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });
});
