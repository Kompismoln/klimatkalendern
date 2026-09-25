import { describe, it, expect, vi } from "vitest";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { shallowMount } from "@vue/test-utils";
import buildCurrentUserResolver from "@/apollo/user";
import flushPromises from "flush-promises";
import { cache } from "@/apollo/memory";
import {
  createMockClient,
  MockApolloClient,
  RequestHandler,
} from "mock-apollo-client";
import SettingsView from "@/views/Admin/SettingsView.vue";
import { nullMock } from "../../common";
import { CONFIG } from "@/graphql/config";
import {
  ADMIN_SETTINGS,
  SAVE_ADMIN_SETTINGS,
  LANGUAGES,
} from "@/graphql/admin";

let mockClient: MockApolloClient | null;
let requestHandlers: Record<string, RequestHandler>;

const languageMock = {
  data: {
    languages: [
      {
        __typename: "Language",
        code: "es",
        name: "Spanish",
      },
      {
        __typename: "Language",
        code: "fr-FR",
        name: "Français",
      },
      {
        __typename: "Language",
        code: "en-EN",
        name: "English",
      },
    ],
  },
};

const settingMock = {
  data: {
    adminSettings: {
      __typename: "AdminSettings",
      contact: "info@mobilizon.test",
      defaultPicture: null,
      instanceDescription: "Welcome to Mobilizon",
      instanceFavicon: null,
      instanceLanguages: ["fr"],
      instanceLogo: null,
      instanceLongDescription: "Mobilizon instance.",
      instanceName: "Mobilizon.test",
      instancePrivacyPolicy: '<p class="message-body">Privacy policy</p>',
      instancePrivacyPolicyType: "DEFAULT",
      instancePrivacyPolicyUrl: null,
      instanceRules: null,
      instanceSlogan: "Long life to Mobilizon",
      instanceTerms: '<p class="message-body">Rulls and terms</p>',
      instanceTermsType: "DEFAULT",
      instanceTermsUrl: null,
      primaryColor: null,
      registrationsOpen: true,
      registrationsModeration: false,
      secondaryColor: null,
    },
  },
};

const generateWrapper = () => {
  mockClient = createMockClient({
    cache,
    resolvers: buildCurrentUserResolver(cache),
  });
  requestHandlers = {
    config: vi.fn().mockResolvedValue(nullMock),
    settings: vi.fn().mockResolvedValue(settingMock),
    save_settings: vi.fn().mockResolvedValue(nullMock),
    languages: vi.fn().mockResolvedValue(languageMock),
  };
  mockClient.setRequestHandler(CONFIG, requestHandlers.config);
  mockClient.setRequestHandler(ADMIN_SETTINGS, requestHandlers.settings);
  mockClient.setRequestHandler(
    SAVE_ADMIN_SETTINGS,
    requestHandlers.save_settings
  );
  mockClient.setRequestHandler(LANGUAGES, requestHandlers.languages);

  return shallowMount(SettingsView, {
    props: {},
    global: {
      provide: {
        [DefaultApolloClient]: mockClient,
      },
    },
  });
};

describe("SettingsView", () => {
  it("Show and save settings", async () => {
    const wrapper = generateWrapper();
    await wrapper.vm.$nextTick();
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
    expect(requestHandlers.config).toHaveBeenCalled();
    expect(requestHandlers.languages).toHaveBeenCalled();
    expect(requestHandlers.settings).toHaveBeenCalled();
    expect(requestHandlers.save_settings).toHaveBeenCalledTimes(0);
    expect(wrapper.html()).toMatchSnapshot();

    expect(wrapper.find("#instance-description").attributes("modelvalue")).toBe(
      "Welcome to Mobilizon"
    );
    expect(wrapper.find("#instance-contact").attributes("modelvalue")).toBe(
      "info@mobilizon.test"
    );
    const radiolist1 = wrapper
      .findAll('o-radio[name="registrationsModeType"]')
      .filter(
        (radio) =>
          radio.attributes("modelvalue") == radio.attributes("native-value")
      );
    expect(radiolist1.length).toBe(1);
    expect(radiolist1[0].text()).toBe(
      "Registration is allowed, anyone can register."
    );

    wrapper.vm.settingsToWrite.instanceDescription = "Best Mobilizon";
    wrapper.vm.settingsToWrite.contact = "some@email.tld";
    wrapper.vm.settingsToWrite.registrationsOpen = false;
    await wrapper.vm.$nextTick();
    expect(wrapper.find("#instance-description").attributes("modelvalue")).toBe(
      "Best Mobilizon"
    );
    expect(wrapper.find("#instance-contact").attributes("modelvalue")).toBe(
      "some@email.tld"
    );
    const radiolist2 = wrapper
      .findAll('o-radio[name="registrationsModeType"]')
      .filter(
        (radio) =>
          radio.attributes("modelvalue") == radio.attributes("native-value")
      );
    expect(radiolist2.length).toBe(1);
    expect(radiolist2[0].text()).toBe("Registration is closed.");
    wrapper.find("form").trigger("submit");
    expect(requestHandlers.save_settings).toHaveBeenCalledTimes(1);
    expect(requestHandlers.save_settings).toBeCalledWith({
      ...settingMock.data.adminSettings,
      contact: "some@email.tld",
      instanceDescription: "Best Mobilizon",
      registrationsOpen: false,
      defaultPicture: {},
      instanceFavicon: {},
      instanceLogo: {},
    });

    wrapper.vm.settingsToWrite.registrationsOpen = true;
    wrapper.vm.settingsToWrite.registrationsModeration = true;
    await wrapper.vm.$nextTick();
    const radiolist3 = wrapper
      .findAll('o-radio[name="registrationsModeType"]')
      .filter(
        (radio) =>
          radio.attributes("modelvalue") == radio.attributes("native-value")
      );
    expect(radiolist3.length).toBe(1);
    expect(radiolist3[0].text()).toBe(
      "Registration is moderated, new user must be validated."
    );
  });
});
