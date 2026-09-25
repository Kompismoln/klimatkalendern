import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { getMockClient } from "../../mocks/client";
import { htmlRemoveId } from "../../common";
import ParticipationButton from "@/components/Event/ParticipationButton.vue";
import { IPerson } from "@/types/actor";
import { EventJoinOptions, ParticipantRole } from "@/types/enums";
import { IEvent } from "@/types/event.model";
import { IParticipant } from "@/types/participant.model";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const generateWrapper = (props) => {
  const global_data = getMockClient([]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return mount(ParticipationButton, {
    props: props,
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

const emptyCurrentActor: IPerson = {};

const currentActor: IPerson = {
  id: "1",
  preferredUsername: "tcit",
  name: "Thomas",
  avatar: {
    url: "https://mobilizon.fr/media/3a5f18c058a8193b1febfaf561f94ae8b91f85ac64c01ddf5ad7b251fb43baf5.jpg?name=profil.jpg",
  },
};

const participation: IParticipant = {
  actor: currentActor,
  role: ParticipantRole.PARTICIPANT,
};

const identities: IPerson[] = [
  currentActor,
  {
    id: "2",
    preferredUsername: "another",
    name: "Another",
    avatar: {
      url: "https://mobilizon.fr/media/95ab5ba92287ab4857bb517cadae2a7ab6a553748d1c48cefc27e2b7ab640fea.jpg?name=FB_IMG_16150214351371162.jpg",
    },
  },
];

const event: IEvent = {
  uuid: "0123456789",
  title: "hello",
  url: "https://mobilizon.fr/events/an-uuid",
  options: {
    anonymousParticipation: false,
  },
  joinOptions: EventJoinOptions.FREE,
};

describe("ParticipationButton", () => {
  it("Show Unlogged", async () => {
    const wrapper = generateWrapper({
      event: event,
      currentActor: emptyCurrentActor,
      participation: undefined,
      identities: [],
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show Basic", async () => {
    const wrapper = generateWrapper({
      event: event,
      currentActor: currentActor,
      participation: undefined,
      identities: identities,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show Basic with confirmation", async () => {
    const wrapper = generateWrapper({
      event: { ...event, joinOptions: EventJoinOptions.RESTRICTED },
      currentActor: currentActor,
      participation: undefined,
      identities: identities,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show Participating", async () => {
    const wrapper = generateWrapper({
      event: event,
      currentActor: currentActor,
      participation: participation,
      identities: identities,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show Pending approval", async () => {
    const wrapper = generateWrapper({
      event: event,
      currentActor: currentActor,
      participation: {
        ...participation,
        role: ParticipantRole.NOT_APPROVED,
      },
      identities: identities,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show Rejected", async () => {
    const wrapper = generateWrapper({
      event: event,
      currentActor: currentActor,
      participation: {
        ...participation,
        role: ParticipantRole.REJECTED,
      },
      identities: identities,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });
});
