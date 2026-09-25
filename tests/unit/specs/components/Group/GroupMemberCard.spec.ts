import { beforeEach, describe, it, expect } from "vitest";
import { enUS } from "date-fns/locale";
import { routes } from "@/router";
import { createRouter, createWebHistory, Router } from "vue-router";
import { config, mount } from "@vue/test-utils";
import { Oruga } from "@oruga-ui/oruga-next";
import flushPromises from "flush-promises";
import { getMockClient } from "../../mocks/client";
import { htmlRemoveId } from "../../common";
import GroupMemberCard from "@/components/Group/GroupMemberCard.vue";
import { IActor } from "@/types/actor";
import { IMember } from "@/types/actor/member.model";
import { MemberRole } from "@/types/enums";

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
  return mount(GroupMemberCard, {
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

const basePerson: IActor = {
  name: "Thomas Citharel",
  preferredUsername: "tcit",
  avatar: baseActorAvatar,
  domain: null,
  url: "",
  summary: "",
  suspended: false,
};

const basicGroup: IActor = {
  name: "Framasoft",
  preferredUsername: "framasoft",
  avatar: {
    url: "https://mobilizon.fr/media/ff5b2d425fb73e17fcbb56a1a032359ee0b21453c11af59e103e783817a32fdf.png?name=framasoft%27s%20avatar.png",
  },
  domain: "mobilizon.fr",
  url: "",
  summary: `<p><strong>La Fediverse</strong>, <strong>c'est la <em><u>Féd</u>ération qui englobe l'Un<u>ivers</u> des réseaux sociaux libres et décentralisés,</em> </strong>dont Mobilizon (évènements), Mastodon (microblog), Peertube (vidéos), Pixelfed (photos), Funkwhale (musique), Matrix (messagerie instantanée)... et tant d'autres font partie.</p><p><strong>Et "La Fediverse <em>Nantaise</em>" est un collectif cherchant à faire connaître localement tout le potentiel de ces réseaux ! :-)</strong></p>`,
  suspended: false,
  members: { total: 0, elements: [] },
  followers: { total: 0, elements: [] },
};

const basicMember: IMember = {
  parent: basicGroup as IActor,
  actor: basePerson,
  role: MemberRole.MEMBER,
};

const moderatorMember: IMember = {
  parent: basicGroup,
  actor: basePerson,
  role: MemberRole.MODERATOR,
};

const adminMember: IMember = {
  parent: basicGroup,
  actor: basePerson,
  role: MemberRole.ADMINISTRATOR,
};

describe("GroupMemberCard", () => {
  it("Show simple member", async () => {
    const wrapper = generateWrapper({
      member: basicMember,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show moderator", async () => {
    const wrapper = generateWrapper({
      member: moderatorMember,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });

  it("Show administrator", async () => {
    const wrapper = generateWrapper({
      member: adminMember,
    });
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(htmlRemoveId(wrapper.html())).toMatchSnapshot();
  });
});
