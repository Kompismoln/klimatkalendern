import {
  formatDateString,
  formatTimeString,
  formatDateTimeString,
} from "./datetime";

export default {
  install(vue: any): void {
    vue.filter("formatDateString", formatDateString);
    vue.filter("formatTimeString", formatTimeString);
    vue.filter("formatDateTimeString", formatDateTimeString);
  },
};
