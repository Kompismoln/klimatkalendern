declare module "*.vue" {
  import type { DefineComponent } from "vue";

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  const component: DefineComponent<{}, {}, {}>;
  export default component;
}

declare module "*.svg" {
  import Vue, { VueConstructor } from "vue";

  const content: VueConstructor<Vue>;
  export default content;
}

declare module "@vue-leaflet/vue-leaflet";
