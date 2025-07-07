import { fakeCurrentActorData } from "../common";

export const loginMock = {
  email: "some@email.tld",
  password: "somepassword",
};

export const loginResponseMock = {
  data: {
    login: {
      __typename: "Login",
      accessToken: "some access token",
      refreshToken: "some refresh token",
      user: {
        __typename: "User",
        email: "some@email.tld",
        id: "1",
        role: "ADMINISTRATOR",
      },
    },
  },
};

export const resetPasswordResponseMock = {
  data: {
    resetPassword: {
      __typename: "Login",
      accessToken: "some access token",
      refreshToken: "some refresh token",
      user: {
        __typename: "User",
        id: "1",
      },
    },
  },
};

export const nullIdentityMock = {
  data: {
    loggedUser: {
      __typename: "loggedUser",
      id: 1,
      actors: null,
    },
  },
};

export const defaultIdentityMock = {
  data: {
    loggedUser: {
      __typename: "loggedUser",
      id: 1,
      actors: [fakeCurrentActorData()],
    },
  },
};
