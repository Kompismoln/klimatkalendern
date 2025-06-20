<template>
  <h1 v-if="!instanceLogoUrl">Klimatkalendern</h1>
  <img v-else alt="" class="max-h-12 w-auto" :src="instanceLogoUrl" />
</template>

<script lang="ts" setup>
import { useInstanceLogoUrl } from "@/composition/apollo/config";
const { instanceLogoUrl } = useInstanceLogoUrl();
</script>
