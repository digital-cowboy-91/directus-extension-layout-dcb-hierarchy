<!-- TODO [HIGH]: Variable indentation size -->
<!-- TODO [MEDIUM]: Max level field -->

<script setup lang="ts">
import { useSync } from "@directus/extensions-sdk";

const props = defineProps<{
  collection: string;
  labelPrimary?: string;
  labelSecondary?: string;
}>();

const emit = defineEmits<{
  (e: "update:labelPrimary", labelPrimary: string): void;
  (e: "update:labelSecondary", labelSecondary: string): void;
}>();

const labelPrimaryWritable = useSync(props, "labelPrimary", emit);
const labelSecondaryWritable = useSync(props, "labelSecondary", emit);
</script>

<template>
  <div class="field">
    <div class="type-label">Primary Label</div>
    <v-collection-field-template
      v-model="labelPrimaryWritable"
      :collection="collection"
    />
  </div>
  <div class="field">
    <div class="type-label">Secondary Label</div>
    <v-collection-field-template
      v-model="labelSecondaryWritable"
      :collection="collection"
    />
  </div>
</template>
