/*
  Utilities for formatting dates and times information according to a locale.

  See also `date-fns` library which can also contain useful utility functions for you.
*/

import type { Locale } from "date-fns";
import { format } from "date-fns";
import type { IEvent } from "@/types/event.model";

/*
  High level formatting.

  The formatting is along the lines of https://github.com/Kompismoln/klimatkalendern/issues/25
  As much as possible, use `formatEventDateTime` format datetime information for events.
  
  When the locale is sv we use custom formatting logic to have the date be super spick and span.
  If the locale is something else we use generic l11n to make the datetime string.
*/

function formatEventDatetime(event: IEvent, locale?: Locale) {
  if (locale?.code === "sv") {
    return formatDateSv(event, locale);
  }
  return formateDateGeneric(event, locale);
}

// Generic procedure for event datetime information
function formateDateGeneric(event: IEvent, locale?: Locale) {
  if (!locale) {
    console.error("Locale is undefined");
    return;
  }

  const b = new Date(event.beginsOn);
  const e = new Date(event.endsOn ?? b); // TODO: How can an event no have an end date?

  // Single day event
  if (
    b.getFullYear() == e.getFullYear() &&
    b.getMonth() == e.getMonth() &&
    b.getDate() == e.getDate()
  ) {
    // No time information
    if (!event.options.showStartTime) {
      return `🗓 ${formatDateForEvent(b, locale)}`;
    }

    // With start time.
    if (event.options.showStartTime && !event.options.showEndTime) {
      return `🗓 ${formatDateTimeForEvent(b, locale)}`;
    }

    // Start and end time.
    return `🗓 ${formatTimeRangeForEvents(b, e, locale)}`;
  }

  // Multi day event
  return `🗓 ${formatDateForEvent(new Date(event.beginsOn), locale)} – ${formatDateForEvent(e, locale)}`;
}

// The custom logic for SE locle.
function formatDateSv(event: IEvent, locale?: Locale) {
  const b = new Date(event.beginsOn);
  const e = new Date(event.endsOn ?? b); // TODO: How can an event no have an end date?

  const bWeekDay = localeShortWeekDayNames(locale)[b.getDay()];
  const eWeekDay = localeShortWeekDayNames(locale)[e.getDay()];

  // NOTE: We never write out which year the event occurs on,
  //       I imagine the cases where that's important are excidingly rare.

  // Single day event
  if (
    b.getFullYear() == e.getFullYear() &&
    b.getMonth() == e.getMonth() &&
    b.getDate() == e.getDate()
  ) {
    // No time information
    if (!event.options.showStartTime) {
      return `🗓 ${capitalize(bWeekDay)} ${b.getDate()} ${getMonthSv(b)}`;
    }

    // With start time.
    if (event.options.showStartTime && !event.options.showEndTime) {
      return `🗓 ${capitalize(bWeekDay)} ${b.getDate()} ${getMonthSv(b)} ${getTimeSv(b)}`;
    }

    // Start and end time.
    return `🗓 ${capitalize(bWeekDay)} ${b.getDate()} ${getMonthSv(b)} ${getTimeRangeSv(b, e)}`;
  }

  // Multi day event
  if (b.getFullYear() == e.getFullYear() && b.getMonth() == e.getMonth()) {
    return `🗓 ${capitalize(bWeekDay)} ${b.getDate()} – ${eWeekDay} ${e.getDate()} ${getMonthSv(b)} ${getTimeRangeSv(b, e)}`;
  }

  // NOTE: This code path is taken for events spanning different years to! But
  //       omitting year will not be confusing assuming events don't span many many monts
  //       or even many years.
  return `🗓 ${capitalize(bWeekDay)} ${b.getDate()} ${getMonthSv(e)} – ${eWeekDay} ${e.getDate()} ${getMonthSv(e)} ${getTimeRangeSv(b, e)}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getMonthSv(date: Date) {
  return [
    "jan",
    "feb",
    "mars",
    "apr",
    "maj",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ][date.getMonth()];
}

function getTimeRangeSv(fromTime: Date, toTime: Date) {
  // TODO: Display only one time if `from` and `to` are the same
  return `${getTimeSv(fromTime)}–${getTimeSv(toTime)}`;
}

function getTimeSv(date: Date) {
  if (date.getMinutes() === 0) {
    return `${date.getHours().toString().padStart(2, "0")}`;
  }
  return `${date.getHours().toString().padStart(2, "0")}.${date.getMinutes().toString().padStart(2, "0")}`;
}

/*
  Low level formatting. Use these when you need more granular control.
*/

function localeMonthNames(locale?: Locale): string[] {
  const monthNames: string[] = [];
  for (let i = 0; i < 12; i += 1) {
    const d = new Date(2019, i, 1);
    const month = d.toLocaleString(locale?.code ?? "default", {
      month: "long",
    });
    monthNames.push(month);
  }
  return monthNames;
}

function localeShortWeekDayNames(locale?: Locale): string[] {
  const weekDayNames: string[] = [];
  for (let i = 13; i < 20; i += 1) {
    const d = new Date(2019, 9, i);
    const weekDay = d.toLocaleString(locale?.code ?? "default", {
      weekday: "short",
    });
    weekDayNames.push(weekDay);
  }
  return weekDayNames;
}

function roundToNearestMinute(date = new Date()) {
  const minutes = 1;
  const ms = 1000 * 60 * minutes;

  // 👇️ replace Math.round with Math.ceil to always round UP
  return new Date(Math.round(date.getTime() / ms) * ms);
}

function formatDateTimeForEvent(dateTime: Date, locale: Locale): string {
  return format(dateTime, "PPp", { locale });
}

function formatDateForEvent(dateTime: Date, locale: Locale): string {
  return format(dateTime, "PP", { locale });
}

function formatTimeRangeForEvents(
  startTime: Date,
  endTime: Date,
  locale: Locale
): string {
  return `${format(startTime, "p", { locale })} – ${format(endTime, "p", { locale })}`;
}

// TODO: formatting file sizes should not be here..
// https://stackoverflow.com/a/18650828/10204399
function formatBytes(
  bytes: number,
  decimals = 2,
  locale: string | undefined = undefined
): string {
  const formatNumber = (value = 0, unit = "byte") =>
    new Intl.NumberFormat(locale, {
      style: "unit",
      unit,
      unitDisplay: "long",
    }).format(value);

  if (bytes === 0) return formatNumber(0);
  if (bytes < 0 || bytes > Number.MAX_SAFE_INTEGER) {
    throw new RangeError(
      "Number mustn't be negative and be inferior to Number.MAX_SAFE_INTEGER"
    );
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    "byte",
    "kilobyte",
    "megabyte",
    "gigabyte",
    "terabyte",
    "petabyte",
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return formatNumber(parseFloat((bytes / k ** i).toFixed(dm)), sizes[i]);
}

export {
  formatEventDatetime,
  localeMonthNames,
  localeShortWeekDayNames,
  roundToNearestMinute,
  formatDateTimeForEvent,
  formatDateForEvent,
  formatTimeRangeForEvents,
  formatBytes,
};
