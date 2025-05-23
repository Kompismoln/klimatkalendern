import {
  CURRENT_USER_CLIENT,
  LOGGED_USER_AND_SETTINGS,
  LOGGED_USER_LOCATION,
  SET_USER_SETTINGS,
  UPDATE_USER_LOCALE,
} from "@/graphql/user";
import { ICurrentUser, IUser } from "@/types/current-user.model";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { computed } from "vue";

export function useCurrentUserClient() {
  const {
    result: currentUserResult,
    error,
    loading,
    onResult,
  } = useQuery<{
    currentUser: ICurrentUser;
  }>(CURRENT_USER_CLIENT);

  const currentUser = computed(() => currentUserResult.value?.currentUser);
  return { currentUser, error, loading, onResult };
}

export function useLoggedUser() {
  const { currentUser } = useCurrentUserClient();

  const { result, error, onError, loading } = useQuery<{ loggedUser: IUser }>(
    LOGGED_USER_AND_SETTINGS,
    {},
    () => ({ enabled: currentUser.value?.id != null })
  );

  const loggedUser = computed(() => result.value?.loggedUser);
  return { loggedUser, error, onError, loading };
}

export function useUserLocation() {
  const {
    result: userSettingsResult,
    error,
    loading,
    onResult,
  } = useQuery<{ loggedUser: IUser }>(LOGGED_USER_LOCATION);

  const location = computed(
    () => userSettingsResult.value?.loggedUser.settings.location
  );
  return { location, error, loading, onResult };
}

export async function doUpdateSetting(
  variables: Record<string, unknown>
): Promise<void> {
  useMutation<{ setUserSettings: string }>(SET_USER_SETTINGS, () => ({
    variables,
  }));
}

export function updateLocale() {
  return useMutation<{ id: string; locale: string }>(UPDATE_USER_LOCALE);
}
