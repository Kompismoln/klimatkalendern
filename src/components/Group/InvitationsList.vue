<template>
  <section class="my-3" v-if="invitations && invitations.length > 0">
    <InvitationCard
      v-for="member in invitations"
      :key="member.id"
      :member="member"
      @accept="() => member.id && acceptInvitation({ id: member.id })"
      @reject="() => member.id && rejectInvitation({ id: member.id })"
    />
  </section>
</template>
<script lang="ts" setup>
import { ACCEPT_INVITATION, REJECT_INVITATION } from "@/graphql/member";
import InvitationCard from "@/components/Group/InvitationCard.vue";
import { PERSON_STATUS_GROUP } from "@/graphql/actor";
import { IMember } from "@/types/actor/member.model";
import { IGroup, IPerson, usernameWithDomain } from "@/types/actor";
import { useMutation } from "@vue/apollo-composable";
import { ErrorResponse } from "@/types/errors.model";
import { inject } from "vue";
import type { Notifier } from "@/plugins/notifier";

defineProps<{
  invitations: IMember[];
}>();

const emit = defineEmits<{
  (e: "accept-invitation", member: IMember): void;
  (e: "reject-invitation", member: IMember): void;
}>();

const {
  mutate: acceptInvitation,
  onDone: onAcceptInvitationDone,
  onError: onAcceptInvitationError,
} = useMutation<{ acceptInvitation: IMember }, { id: string }>(
  ACCEPT_INVITATION,
  {
    refetchQueries({ data }) {
      const profile = data?.acceptInvitation?.actor as IPerson;
      const group = data?.acceptInvitation?.parent as IGroup;
      if (profile && group) {
        return [
          {
            query: PERSON_STATUS_GROUP,
            variables: { id: profile.id, group: usernameWithDomain(group) },
          },
        ];
      }
      return [];
    },
  }
);

const notifier = inject<Notifier>("notifier");

const onError = (error: ErrorResponse) => {
  console.error(error);
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    notifier?.error(error.graphQLErrors[0].message);
  }
};

onAcceptInvitationDone((result) => {
  if (!result.data?.acceptInvitation) {
    console.error(result);
    alert("Error while accepting invitation");
    return;
  }
  emit("accept-invitation", result.data?.acceptInvitation);
});

onAcceptInvitationError((err) => onError(err as unknown as ErrorResponse));

const {
  mutate: rejectInvitation,
  onDone: onRejectInvitationDone,
  onError: onRejectInvitationError,
} = useMutation<{ rejectInvitation: IMember }, { id: string }>(
  REJECT_INVITATION,
  {
    refetchQueries({ data }) {
      // TODO Refetching the PERSON_STATUS_GROUP query is useless for the Mygroup.vue page
      const profile = data?.rejectInvitation?.actor as IPerson;
      const group = data?.rejectInvitation?.parent as IGroup;
      if (profile && group) {
        return [
          {
            query: PERSON_STATUS_GROUP,
            variables: { id: profile.id, group: usernameWithDomain(group) },
          },
        ];
      }
      return [];
    },
  }
);

onRejectInvitationDone((result) => {
  if (!result.data?.rejectInvitation) {
    console.error(result);
    alert("Error while rejecting invitation");
    return;
  }
  emit("reject-invitation", result.data?.rejectInvitation);
});

onRejectInvitationError((err) => onError(err as unknown as ErrorResponse));
</script>
