import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { CONFIG } from "@/graphql/config";
import { getMockClient } from "../../mocks/client";
import EventActionSection from "@/components/Event/EventActionSection.vue";
import { IPerson } from "@/types/actor";
import { IParticipant } from "@/types/participant.model";
import {
  ActorType,
  CommentModeration,
  EventJoinOptions,
  ParticipantRole,
} from "@/types/enums";
import { shallowMount } from "@vue/test-utils";

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const eventData = {
  id: "1",
  uuid: "f37910ea-fd5a-4756-9679-00971f3f4106",
  options: {
    commentModeration: CommentModeration.ALLOW_ALL,
    hideNumberOfParticipants: false,
  },
  draft: false,
  joinOptions: EventJoinOptions.FREE,
  beginsOn: new Date("2089-12-04T09:21:25Z"),
  endsOn: new Date("2089-12-04T11:21:25Z"),
  participantStats: {
    notApproved: 0,
    notConfirmed: 0,
    rejected: 0,
    participant: 0,
    creator: 1,
    moderator: 0,
    administrator: 0,
    going: 1,
  },
};

const participantData = {
  id: "5",
  role: ParticipantRole.NOT_APPROVED,
  insertedAt: "2020-12-07T09:33:41Z",
  metadata: {
    cancellationToken: "some token",
    message: "a message long enough",
  },
  event: eventData,
  actor: {
    preferredUsername: "some_actor",
    name: "Some actor",
    avatar: null,
    domain: null,
    id: "1",
    url: "@some_actor",
    summary: "summary",
    suspended: false,
    type: ActorType.PERSON,
  },
};

const generateWrapper = (
  eventExtra: any = {},
  currentActor: IPerson | undefined = undefined,
  participations: IParticipant[] = [],
  person: IPerson | undefined = undefined
) => {
  const global_data = getMockClient([CONFIG]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return shallowMount(EventActionSection, {
    props: {
      event: {
        ...eventData,
        ...eventExtra,
      },
      currentActor: currentActor,
      participations: participations,
      person: person,
    },
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("EventActionSection", () => {
  it("event action section with basic informations", async () => {
    const wrapper = generateWrapper();
    await wrapper.vm.$nextTick();
    expect(wrapper.find("p.inline-flex > span > span").text()).toBe(
      "No one is participating"
    );
    expect(
      wrapper
        .find("o-modal > .modal-card > .modal-card-head > .modal-card-title")
        .text()
    ).toBe("Participation confirmation");
    expect(
      wrapper.find("o-modal > .modal-card > .modal-card-body > p").text()
    ).toBe(
      "The event organiser has chosen to validate manually participations. Do you want to add a little note to explain why you want to participate to this event?"
    );
    expect(wrapper.html()).toMatchSnapshot();
  });

  it("event action section with participant", async () => {
    const wrapper = generateWrapper(
      {
        options: {
          maximumAttendeeCapacity: 10,
        },
        participantStats: {
          participant: 5,
        },
      },
      undefined,
      [participantData],
      undefined
    );
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.canManageEvent).toBe(false);
    expect(wrapper.find("p.inline-flex > span > span").text()).toBe(
      "5/10 available places"
    );
    expect(wrapper.findAll("o-dropdown > o-dropdown-item").length).toBe(2);
    expect(
      wrapper.find("o-dropdown > o-dropdown-item:nth-of-type(1)").text()
    ).toBe("Share this event");
    expect(
      wrapper.find("o-dropdown > o-dropdown-item:nth-of-type(2)").text()
    ).toBe("Add to my calendar");
    expect(
      wrapper
        .find("o-modal > .modal-card > .modal-card-head > .modal-card-title")
        .text()
    ).toBe("Participation confirmation");
    expect(
      wrapper.find("o-modal > .modal-card > .modal-card-body > p").text()
    ).toBe(
      "The event organiser has chosen to validate manually participations. Do you want to add a little note to explain why you want to participate to this event?"
    );
    expect(wrapper.html()).toMatchSnapshot();
  });

  it("event action section with creator as participant", async () => {
    const wrapper = generateWrapper(
      {},
      undefined,
      [
        {
          ...participantData,
          role: ParticipantRole.CREATOR,
        },
      ],
      undefined
    );
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.canManageEvent).toBe(true);
    expect(wrapper.find(".participations-link").text()).toBe(
      "No one is participating"
    );
    expect(wrapper.findAll("o-dropdown > o-dropdown-item").length).toBe(7);
    expect(
      wrapper.find("o-dropdown > o-dropdown-item:nth-of-type(1)").text()
    ).toBe("Participations");
    expect(
      wrapper.find("o-dropdown > o-dropdown-item:nth-of-type(2)").text()
    ).toBe("Announcements");
    expect(
      wrapper.find("o-dropdown > o-dropdown-item:nth-of-type(3)").text()
    ).toBe("Edit");
    expect(
      wrapper.find("o-dropdown > o-dropdown-item:nth-of-type(4)").text()
    ).toBe("Duplicate");
    expect(
      wrapper.find("o-dropdown > o-dropdown-item:nth-of-type(5)").text()
    ).toBe("Delete");
    expect(
      wrapper.find("o-dropdown > o-dropdown-item:nth-of-type(6)").text()
    ).toBe("Share this event");
    expect(
      wrapper.find("o-dropdown > o-dropdown-item:nth-of-type(7)").text()
    ).toBe("Add to my calendar");
    expect(
      wrapper
        .find("o-modal > .modal-card > .modal-card-head > .modal-card-title")
        .text()
    ).toBe("Participation confirmation");
    expect(
      wrapper.find("o-modal > .modal-card > .modal-card-body > p").text()
    ).toBe(
      "The event organiser has chosen to validate manually participations. Do you want to add a little note to explain why you want to participate to this event?"
    );
    expect(wrapper.html()).toMatchSnapshot();
  });
});
