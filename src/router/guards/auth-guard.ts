import { NavigationGuard } from "vue-router";
import { UserRouteName } from "@/router/user";
import RouteName from "@/router/name";
import { AUTH_ACCESS_TOKEN, AUTH_USER_ACTOR_ID } from "@/constants";
import { LoginErrorCode } from "@/types/enums";
import { SettingsRouteName } from "../settings";

export const authGuardIfNeeded: NavigationGuard = async (to, from, next) => {
  if (to.meta?.requiredAuth !== true) return next();

  // 1. A route that requiredAuth need a connected user
  // We can't use "currentUser" from apollo here
  // because we may not have loaded the user from the local storage yet
  if (!localStorage.getItem(AUTH_ACCESS_TOKEN)) {
    return next({
      name: UserRouteName.LOGIN,
      query: {
        code: LoginErrorCode.NEED_TO_LOGIN,
        redirect: to.fullPath,
      },
    });
  }

  // 2. A route that requiredAuth also need a selected profile
  // except for all Settings Route
  const isInSettingsRoute = Object.values(SettingsRouteName).includes(
    to.name as SettingsRouteName
  );

  // Redirect to CREATE_IDENTITY if a user without a selected profile
  // try to access a requiredAuth route not in SettingsRouteName
  if (!localStorage.getItem(AUTH_USER_ACTOR_ID) && !isInSettingsRoute) {
    return next({
      name: RouteName.CREATE_IDENTITY,
    });
  }

  return next();
};
