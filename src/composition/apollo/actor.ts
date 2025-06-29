import {
  CURRENT_ACTOR_CLIENT,
  GROUP_MEMBERSHIP_SUBSCRIPTION_CHANGED,
  IDENTITIES,
  PERSON_STATUS_GROUP,
} from "@/graphql/actor";
import { IPerson } from "@/types/actor";
import { ICurrentUser } from "@/types/current-user.model";
import { useQuery } from "@vue/apollo-composable";
import { computed, Ref, unref } from "vue";
import { useCurrentUserClient } from "./user";

export function useCurrentActorClient() {
  const { identities } = useCurrentUserIdentities();

  // There is a current actor only if there is at least one identity
  const enabled = computed(
    () => identities.value != undefined && identities.value?.length > 0
  );

  const {
    result: currentActorResult,
    error,
    loading,
  } = useQuery<{ currentActor: IPerson }>(CURRENT_ACTOR_CLIENT, {}, () => ({
    enabled: enabled,
  }));

  const currentActor = computed<IPerson | undefined>(() =>
    enabled.value ? currentActorResult.value?.currentActor : undefined
  );

  return { currentActor, error, loading };
}

export function useCurrentUserIdentities() {
  const { currentUser } = useCurrentUserClient();

  const enabled = computed(
    () =>
      currentUser.value?.id !== undefined &&
      currentUser.value?.id !== null &&
      currentUser.value?.isLoggedIn === true
  );

  const { result, error, loading } = useQuery<{
    loggedUser: Pick<ICurrentUser, "actors">;
  }>(
    IDENTITIES,
    {
      // To ensure the request is re-executed when the user changes,
      // we include a dummy `_user` parameter that's ignored by the server.
      // This function does not depend on the user, the server identifies them by the token.
      // So without this dummy parameter, the GraphQL call is not automatically reloaded
      // when the actor changes.
      _user: currentUser?.value?.id,
    },
    () => ({
      enabled: enabled,
      fetchPolicy: "network-only",
    })
  );

  const identities = computed(() =>
    enabled.value ? result.value?.loggedUser?.actors : undefined
  );

  return { identities, error, loading };
}

export function usePersonStatusGroup(
  groupFederatedUsername: string | undefined | Ref<string | undefined>
) {
  const { currentActor } = useCurrentActorClient();
  const { result, error, loading, subscribeToMore } = useQuery<{
    person: IPerson;
  }>(
    PERSON_STATUS_GROUP,
    () => ({
      id: currentActor.value?.id,
      group: unref(groupFederatedUsername),
    }),
    () => ({
      enabled:
        currentActor.value?.id !== undefined &&
        unref(groupFederatedUsername) !== undefined &&
        unref(groupFederatedUsername) !== "",
    })
  );
  subscribeToMore(() => ({
    document: GROUP_MEMBERSHIP_SUBSCRIPTION_CHANGED,
    variables: {
      actorId: currentActor.value?.id,
      group: unref(groupFederatedUsername),
    },
  }));
  const person = computed(() => result.value?.person);
  return { person, error, loading };
}
