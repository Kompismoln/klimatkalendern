<template>
  <section class="container mx-auto px-1 mb-6">
    <h1 class="title">{{ t("My groups") }}</h1>
    <p>
      {{
        t(
          "Groups are spaces for coordination and preparation to better organize events and manage your community."
        )
      }}
    </p>
    <div class="flex my-3" v-if="!hideCreateGroupButton">
      <o-button
        tag="router-link"
        variant="primary"
        :to="{ name: RouteName.CREATE_GROUP }"
        >{{ t("Create group") }}</o-button
      >
    </div>
    <o-loading v-model:active="loading"></o-loading>
    <InvitationsList
      :invitations="invitations"
      @accept-invitation="refetchLoggedUserMemberships"
      @reject-invitation="refetchLoggedUserMemberships"
    />
    <section v-if="memberships && memberships.length > 0">
      <GroupMemberCard
        class="group-member-card"
        v-for="member in memberships"
        :key="member.id"
        :member="member"
        @leave="leaveGroup({ groupId: member.parent.id })"
      />
      <o-pagination
        :total="membershipsPages.total"
        v-show="membershipsPages.total > limit"
        v-model:current="page"
        :per-page="limit"
        :aria-next-label="t('Next page')"
        :aria-previous-label="t('Previous page')"
        :aria-page-label="t('Page')"
        :aria-current-label="t('Current page')"
      >
      </o-pagination>
    </section>
    <section
      class="text-center not-found"
      v-if="memberships.length === 0 && !loading"
    >
      <div class="">
        <div class="">
          <div class="text-center prose dark:prose-invert max-w-full">
            <p>
              {{ t("You are not part of any group.") }}
              <i18n-t
                keypath="Do you wish to {create_group} or {explore_groups}?"
              >
                <template #create_group>
                  <router-link :to="{ name: RouteName.CREATE_GROUP }">{{
                    t("create a group")
                  }}</router-link>
                </template>
                <template #explore_groups>
                  <router-link
                    :to="{
                      name: RouteName.SEARCH,
                      query: { contentType: ContentType.GROUPS },
                    }"
                    >{{ t("explore the groups") }}</router-link
                  >
                </template>
              </i18n-t>
            </p>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<script lang="ts" setup>
import { LOGGED_USER_MEMBERSHIPS } from "@/graphql/actor";
import { LEAVE_GROUP } from "@/graphql/group";
import GroupMemberCard from "@/components/Group/GroupMemberCard.vue";
import InvitationsList from "@/components/Group/InvitationsList.vue";
import { IMember } from "@/types/actor/member.model";
import { MemberRole, ContentType } from "@/types/enums";
import RouteName from "../../router/name";
import { useRestrictions } from "@/composition/apollo/config";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { IUser } from "@/types/current-user.model";
import { integerTransformer, useRouteQuery } from "vue-use-route-query";
import { computed, inject } from "vue";
import { useHead } from "@/utils/head";
import { useI18n } from "vue-i18n";
import { Notifier } from "@/plugins/notifier";

const page = useRouteQuery("page", 1, integerTransformer);
const limit = 10;

const {
  result: membershipsResult,
  loading,
  refetch: refetchLoggedUserMemberships,
} = useQuery<{
  loggedUser: Pick<IUser, "memberships">;
}>(
  LOGGED_USER_MEMBERSHIPS,
  () => ({
    page: page.value,
    limit,
  }),
  () => ({
    // always display the latest information
    fetchPolicy: "cache-and-network",
  })
);

const membershipsPages = computed(
  () =>
    membershipsResult.value?.loggedUser?.memberships ?? {
      total: 0,
      elements: [],
    }
);

const { t } = useI18n({ useScope: "global" });

useHead({
  title: t("My groups"),
});

const notifier = inject<Notifier>("notifier");

const { mutate: leaveGroup, onError: onLeaveGroupError } = useMutation(
  LEAVE_GROUP,
  () => ({
    refetchQueries: [
      {
        query: LOGGED_USER_MEMBERSHIPS,
        variables: {
          page,
          limit,
        },
      },
    ],
  })
);

onLeaveGroupError((error) => {
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    notifier?.error(error.graphQLErrors[0].message);
  }
});

const invitations = computed((): IMember[] => {
  if (!membershipsPages.value) return [];
  return membershipsPages.value.elements.filter(
    (member: IMember) => member.role === MemberRole.INVITED
  );
});

const memberships = computed((): IMember[] => {
  if (!membershipsPages.value) return [];
  return membershipsPages.value.elements.filter(
    (member: IMember) =>
      ![MemberRole.INVITED, MemberRole.REJECTED].includes(member.role)
  );
});

const { restrictions } = useRestrictions();

const hideCreateGroupButton = computed((): boolean => {
  return restrictions.value?.onlyAdminCanCreateGroups === true;
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.participation {
  margin: 1rem auto;
}

section {
  .upcoming-month {
    text-transform: capitalize;
  }
}

.group-member-card {
  margin-bottom: 1rem;
}
</style>
