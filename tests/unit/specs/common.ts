import { CURRENT_ACTOR_CLIENT } from "@/graphql/actor";
import { CURRENT_USER_LOCATION_CLIENT } from "@/graphql/location";
import { CURRENT_USER_CLIENT } from "@/graphql/user";
import { ICurrentUserRole } from "@/types/enums";
import {
  ApolloCache,
  NormalizedCacheObject,
  Resolver,
  type Resolvers,
} from "@apollo/client";

export const fakeCurrentUserData: Resolver = (): Record<string, any> => {
  return {
    __typename: "CurrentUser",
    id: "2",
    email: "user@mail.com",
    role: ICurrentUserRole.USER,
    isLoggedIn: true,
  };
};

export const fakeCurrentActorData: Resolver = (): Record<string, any> => {
  return {
    __typename: "CurrentActor",
    id: "67",
    preferredUsername: "someone",
    name: "Personne",
    avatar: null,
  };
};

export function defaultResolvers(
  cache: ApolloCache<NormalizedCacheObject>
): Resolvers {
  cache?.writeQuery({
    query: CURRENT_USER_CLIENT,
    data: {
      currentUser: fakeCurrentUserData(),
    },
  });

  cache?.writeQuery({
    query: CURRENT_ACTOR_CLIENT,
    data: {
      currentActor: fakeCurrentActorData(),
    },
  });

  cache?.writeQuery({
    query: CURRENT_USER_LOCATION_CLIENT,
    data: {
      currentUserLocation: {
        lat: null,
        lon: null,
        accuracy: null,
        isIPLocation: null,
        name: null,
        picture: null,
      },
    },
  });

  return {
    Query: {
      currentUser: fakeCurrentUserData,
      currentActor: fakeCurrentActorData,
    },
  } satisfies Resolvers;
}

export function htmlRemoveId(htmlText: string) {
  return htmlText
    .replaceAll(/ id="[a-z0-9]+" /gi, ' id="" ')
    .replaceAll(/ for="[a-z0-9]+"/gi, ' for=""');
}

export const nullMock = {
  data: {},
};
