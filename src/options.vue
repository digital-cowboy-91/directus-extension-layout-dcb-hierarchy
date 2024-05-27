<!-- TODO [MEDIUM]: Max level field -->

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useSync } from "@directus/extensions-sdk";

const { t } = useI18n();

const props = defineProps<{
  collection: string;
  labelPrimary?: string;
  labelRight?: string;
  labelSecondary?: string;
  indentation?: "compact" | "cozy" | "comfortable";
}>();

const emit = defineEmits<{
  (e: "update:labelPrimary", labelPrimary: string): void;
  (e: "update:labelSecondary", labelSecondary: string): void;
  (e: "update:labelRight", labelRight: string): void;
  (e: "update:indentation", indentation: string): void;
}>();

const labelPrimaryWritable = useSync(props, "labelPrimary", emit);
const labelSecondaryWritable = useSync(props, "labelSecondary", emit);
const labelRightWritable = useSync(props, "labelRight", emit);
const indentationWritable = useSync(props, "indentation", emit);
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
  <div class="field">
    <div class="type-label">Right Label</div>
    <v-collection-field-template
      v-model="labelRightWritable"
      :collection="collection"
    />
  </div>
  <div class="field">
    <div class="type-label">Indentation</div>
    <v-select
      v-model="indentationWritable"
      :items="[
        {
          text: t('layouts.tabular.compact'),
          value: 'compact',
        },
        {
          text: t('layouts.tabular.cozy'),
          value: 'cozy',
        },
        {
          text: t('layouts.tabular.comfortable'),
          value: 'comfortable',
        },
      ]"
    />
  </div>
</template>
