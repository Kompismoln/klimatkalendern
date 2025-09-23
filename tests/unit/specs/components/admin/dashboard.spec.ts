import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { getMockClient, requestHandlers } from "../../mocks/client";
import DashboardView from "@/views/Admin/DashboardView.vue";
import { config, shallowMount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { DASHBOARD } from "@/graphql/admin";

config.global.plugins.push(Oruga);

let router: Router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  });

  // await router.isReady();
});

const dashboard_mock = {
  data: {
    dashboard: {
      __typename: "Dashboard",
      lastGroupCreated: {
        __typename: "Group",
        avatar: null,
        domain: null,
        id: "1125368",
        name: "lastGroup",
        preferredUsername: "lastgroup",
        summary: null,
        type: "GROUP",
        url: "https://mobilizon.test/@lastGroup",
      },
      lastPublicEventPublished: {
        __typename: "Event",
        attributedTo: {
          __typename: "Group",
          avatar: null,
          domain: null,
          id: "1125368",
          name: "lastGroup",
          preferredUsername: "lastgroup",
          summary: null,
          type: "GROUP",
          url: "https://mobilizon.test/@lastGroup",
        },
        beginsOn: "2026-04-28T15:00:00Z",
        id: "2675674",
        options: {
          __typename: "EventOptions",
          anonymousParticipation: false,
          attendees: null,
          commentModeration: "CLOSED",
          hideNumberOfParticipants: false,
          hideOrganizerWhenGroupEvent: false,
          isOnline: false,
          maximumAttendeeCapacity: null,
          offers: [],
          participationConditions: null,
          program: null,
          remainingAttendeeCapacity: null,
          showEndTime: true,
          showParticipationPrice: null,
          showRemainingAttendeeCapacity: null,
          showStartTime: true,
          timezone: "Europe/Paris",
        },
        organizerActor: {
          __typename: "Person",
          avatar: null,
          domain: null,
          id: "109687",
          name: "organizer",
          preferredUsername: "organizer",
          summary: "Organizer",
          type: "PERSON",
          url: "https://mobilizion.test/@organizer",
        },
        picture: {
          __typename: "Media",
          alt: null,
          url: "https://mobilizion.test/media/f57a2cfc8c959b0dafc94c0eed74ad8f7050844ce1c9147fcdb58dd2ac709cde.webp?name=Market.webp",
          uuid: "1416f0ff-826d-44ba-94c7-e81b29095f87",
        },
        title: "Last event very nice",
        uuid: "76600bf1-b870-4577-9941-1072ebdcd753",
      },
      numberOfComments: 5,
      numberOfConfirmedParticipationsToLocalEvents: 23,
      numberOfEvents: 340,
      numberOfFollowers: 12,
      numberOfFollowings: 35,
      numberOfGroups: 67,
      numberOfReports: 9,
      numberOfUsers: 220,
    },
  },
};

const generateWrapper = (mock_dashboard = {}) => {
  const global_data = getMockClient([[DASHBOARD, mock_dashboard]]);
  global_data.provide.dateFnsLocale = enUS;
  global_data.plugins = [router];
  return shallowMount(DashboardView, {
    global: {
      ...global_data,
      stubs: {
        RouterLink: false,
      },
    },
  });
};

describe("Dashboard", () => {
  it("Show simple", async () => {
    const wrapper = generateWrapper(dashboard_mock);
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.html()).toMatchSnapshot();
    expect(requestHandlers.handle_0).toHaveBeenCalledTimes(1);
    expect(requestHandlers.handle_0).toHaveBeenCalledWith({});
  });
});
