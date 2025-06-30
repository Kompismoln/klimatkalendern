import "./specs/mocks/matchMedia";
import { config } from "@vue/test-utils";
import { createHead } from "@unhead/vue";
import { i18n } from "@/utils/i18n";
import { afterEach, beforeEach, vi } from "vitest";

const head = createHead();

config.global.plugins.push(head);
config.global.plugins.push(i18n);

beforeEach(() => {
  const mokeDate = new Date("2022-02-02T02:04:00.000Z");
  vi.useFakeTimers();
  vi.setSystemTime(mokeDate);
});

afterEach(() => {
  vi.useRealTimers();
});
