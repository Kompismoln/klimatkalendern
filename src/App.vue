<template>
  <div id="mobilizon">
    <!-- <VueAnnouncer /> -->
    <a
      class="peer sr-only left-1/2 top-6 z-[101] !inline-flex -translate-x-1/2 focus-visible:not-sr-only focus-visible:absolute focus-visible:!outline-none"
      href="#main"
    >
      <span class="block px-3 py-2">{{ t("Skip to main content") }}</span>
    </a>

    <NavBar />
    <div v-if="isDemoMode">
      <o-notification
        class="container mx-auto"
        variant="danger"
        :title="t('Warning').toLocaleUpperCase()"
        closable
        :aria-close-label="t('Close')"
      >
        <p>
          {{ t("This is a demonstration site to test Mobilizon.") }}
          <b>{{ t("Please do not use it in any real way.") }}</b>
          {{
            t(
              "This website isn't moderated and the data that you enter will be automatically destroyed every day at 00:01 (Paris timezone)."
            )
          }}
        </p>
      </o-notification>
    </div>
    <ErrorComponent v-if="error" :error="error" />

    <main id="main" class="px-2 py-4" v-else>
      <router-view></router-view>
    </main>
    <mobilizon-footer />
  </div>
</template>

<script lang="ts" setup>
import NavBar from "@/components/NavBar.vue";
import {
  AUTH_ACCESS_TOKEN,
  AUTH_USER_EMAIL,
  AUTH_USER_ID,
  AUTH_USER_ROLE,
} from "@/constants";
import { UPDATE_CURRENT_USER_CLIENT } from "@/graphql/user";
import MobilizonFooter from "@/components/PageFooter.vue";
import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "jwt-decode";
import { refreshAccessToken } from "@/apollo/utils";
import {
  reactive,
  ref,
  provide,
  onUnmounted,
  onMounted,
  onBeforeMount,
  inject,
  defineAsyncComponent,
  computed,
  watch,
  onBeforeUnmount,
} from "vue";
import { LocationType } from "@/types/user-location.model";
import { useMutation, useQuery } from "@vue/apollo-composable";
import {
  initializeCurrentActor,
  NoIdentitiesException,
} from "@/utils/identity";
import { useI18n } from "vue-i18n";
import { Notifier } from "@/plugins/notifier";
import { CONFIG } from "@/graphql/config";
import { IConfig } from "@/types/config.model";
import { useRouter } from "vue-router";
import RouteName from "@/router/name";
import { useCurrentUserIdentities } from "./composition/apollo/actor";

const { result: configResult } = useQuery<{ config: IConfig }>(
  CONFIG,
  undefined,
  { fetchPolicy: "cache-only" }
);

const config = computed(() => configResult.value?.config);

const ErrorComponent = defineAsyncComponent(
  () => import("@/components/ErrorComponent.vue")
);

const { t } = useI18n({ useScope: "global" });

const location = computed(() => config.value?.location);

const userLocation = reactive<LocationType>({
  lon: undefined,
  lat: undefined,
  name: undefined,
  picture: undefined,
  isIPLocation: true,
  accuracy: 100,
});

const updateUserLocation = (newLocation: LocationType) => {
  userLocation.lat = newLocation.lat;
  userLocation.lon = newLocation.lon;
  userLocation.name = newLocation.name;
  userLocation.picture = newLocation.picture;
  userLocation.isIPLocation = newLocation.isIPLocation;
  userLocation.accuracy = newLocation.accuracy;
};

updateUserLocation({
  lat: location.value?.latitude,
  lon: location.value?.longitude,
  name: "", // config.ipLocation.country.name,
  isIPLocation: true,
  accuracy: 150, // config.ipLocation.location.accuracy_radius * 1.5 || 150,
});

provide("userLocation", {
  userLocation,
  updateUserLocation,
});

// const routerView = ref("routerView");
const error = ref<Error | null>(null);
const online = ref(true);
const interval = ref<number>(0);

const notifier = inject<Notifier>("notifier");

interval.value = window.setInterval(async () => {
  const accessToken = localStorage.getItem(AUTH_ACCESS_TOKEN);
  if (accessToken) {
    const token = jwtDecode<JwtPayload>(accessToken);
    if (
      token?.exp !== undefined &&
      new Date(token.exp * 1000 - 60000) < new Date()
    ) {
      refreshAccessToken();
    }
  }
}, 60000) as unknown as number;

const { identities } = useCurrentUserIdentities();

onBeforeMount(async () => {
  console.debug("App: onBeforeMount...");

  // Try to init the user
  if (!initializeCurrentUser()) return;
});

watch(identities, async () => {
  // Try to init the identities and set one of them
  console.log("identities has changed", identities.value);
  try {
    if (!identities.value) return;

    console.log("We will initializeCurrentActor");
    await initializeCurrentActor(identities.value);
  } catch (err) {
    if (err instanceof NoIdentitiesException) {
      console.log("Route to CREATE_IDENTITY because user has no identity");
      router.push({ name: RouteName.CREATE_IDENTITY });
    } else {
      throw err;
    }
  }
});

const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");

onMounted(() => {
  online.value = window.navigator.onLine;
  window.addEventListener("offline", () => {
    online.value = false;
    showOfflineNetworkWarning();
    console.debug("offline");
  });
  window.addEventListener("online", () => {
    online.value = true;
    console.debug("online");
  });
  darkModePreference.addEventListener("change", changeTheme);
});

onUnmounted(() => {
  clearInterval(interval.value);
  interval.value = 0;
});

const { mutate: updateCurrentUser } = useMutation(UPDATE_CURRENT_USER_CLIENT);

const initializeCurrentUser = () => {
  console.debug("Initializing current user");
  const userId = localStorage.getItem(AUTH_USER_ID);
  const userEmail = localStorage.getItem(AUTH_USER_EMAIL);
  const accessToken = localStorage.getItem(AUTH_ACCESS_TOKEN);
  const role = localStorage.getItem(AUTH_USER_ROLE);

  if (userId && userEmail && accessToken && role) {
    const userData = {
      id: userId,
      email: userEmail,
      isLoggedIn: true,
      role,
    };
    updateCurrentUser(userData);
    console.debug("Initialized current user", userData);
    return true;
  }
  console.debug("We don't seem to have a currently logged-in user");
  return false;
};

const showOfflineNetworkWarning = (): void => {
  notifier?.error(t("You are offline"));
};

const router = useRouter();

watch(config, async (configWatched: IConfig | undefined) => {
  if (configWatched) {
    const { statistics } = await import("@/services/statistics");
    statistics(configWatched?.analytics, {
      router,
      version: configWatched.version,
    });
  }
});

const isDemoMode = computed(() => config.value?.demoMode);

const changeTheme = () => {
  console.debug("changing theme");
  if (
    localStorage.getItem("theme") === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

onBeforeUnmount(() => {
  darkModePreference.removeEventListener("change", changeTheme);
});
</script>

<style lang="scss">
#mobilizon {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  main {
    flex-grow: 1;
  }
}

.vue-skip-to {
  z-index: 40;
}
</style>
