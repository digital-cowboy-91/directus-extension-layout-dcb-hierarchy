<script setup lang="ts">
import { useSync } from "@directus/extensions-sdk";

const props = defineProps<{
  collection: string;
  primaryLabel?: string;
  secondaryLable?: string;
}>();

const emit = defineEmits<{
  (e: "update:primaryLabel", primaryLabel: string): void;
  (e: "update:secondaryLable", secondaryLable: string): void;
}>();

const primaryLabelWritable = useSync(props, "primaryLabel", emit);
const secondaryLableWritable = useSync(props, "secondaryLable", emit);
</script>

<template>
  <div class="field">
    <div class="type-label">Primary Label</div>
    <v-collection-field-template
      v-model="primaryLabelWritable"
      :collection="collection"
    />
  </div>
  <div class="field">
    <div class="type-label">Secondary Label</div>
    <v-collection-field-template
      v-model="secondaryLableWritable"
      :collection="collection"
    />
  </div>
</template>
