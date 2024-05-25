<script setup lang="ts">
import { useSync } from "@directus/extensions-sdk";

const props = defineProps<{
  collection: string;
  primaryLabel?: string;
  secondaryLabel?: string;
}>();

const emit = defineEmits<{
  (e: "update:primaryLabel", primaryLabel: string): void;
  (e: "update:secondaryLabel", secondaryLabel: string): void;
}>();

const primaryLabelWritable = useSync(props, "primaryLabel", emit);
const secondaryLabelWritable = useSync(props, "secondaryLabel", emit);
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
      v-model="secondaryLabelWritable"
      :collection="collection"
    />
  </div>
</template>
