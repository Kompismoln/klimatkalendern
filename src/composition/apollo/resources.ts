import { useQuery } from "@vue/apollo-composable";
import { computed, unref } from "vue";
import { useCurrentUserClient } from "./user";
import type { Ref } from "vue";
import { IGroup } from "@/types/actor";
import { GROUP_RESOURCES_LIST } from "@/graphql/resources";
import { useCurrentActorClient } from "./actor";

export function useGroupResourcesList(
  name: string | undefined | Ref<string | undefined>,
  options?: {
    resourcesPage?: number;
    resourcesLimit?: number;
  }
) {
  const { currentUser } = useCurrentUserClient();
  const { currentActor } = useCurrentActorClient();

  const { result, error, loading, onResult, onError, refetch } = useQuery<
    {
      group: Pick<
        IGroup,
        "id" | "preferredUsername" | "name" | "domain" | "resources"
      >;
    },
    {
      name: string;
      resourcesPage?: number;
      resourcesLimit?: number;
    }
  >(
    GROUP_RESOURCES_LIST,
    () => ({
      name: unref(name),
      // To ensure the request is re-executed when the actor changes,
      // we include a dummy `_actor` parameter that's ignored by the server.
      // This function does not depend on the actor, the server identifies them by the token.
      // So without this dummy parameter, the GraphQL call is not automatically reloaded
      // when the actor changes.
      _actor: currentActor?.value?.id,
      ...options,
    }),
    () => ({
      enabled:
        unref(name) !== undefined &&
        unref(name) !== "" &&
        currentUser.value?.isLoggedIn,
      fetchPolicy: "cache-and-network",
    })
  );
  const group = computed(() => result.value?.group);
  return { group, error, loading, onResult, onError, refetch };
}
