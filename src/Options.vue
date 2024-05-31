<!-- TODO [MEDIUM]: Max level field -->

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useSync } from "@directus/extensions-sdk";
import { TLayoutOptions, TOptionIndentation, TOptionLabel } from "./types";

const { t } = useI18n();

type TProps = {
  collection: string;
} & TLayoutOptions;

const props = defineProps<TProps>();

const emit = defineEmits<{
  (e: "update:labelPrimary", value: TOptionLabel): void;
  (e: "update:labelSecondary", value: TOptionLabel): void;
  (e: "update:labelRight", value: TOptionLabel): void;
  (e: "update:indentation", value: TOptionIndentation): void;
}>();

const labelPrimaryRef = useSync(props, "labelPrimary", emit);
const labelSecondaryRef = useSync(props, "labelSecondary", emit);
const labelRightRef = useSync(props, "labelRight", emit);
const indentationRef = useSync(props, "indentation", emit);
</script>

<template>
  <div class="field">
    <div class="type-label">Primary Label</div>
    <v-collection-field-template
      v-model="labelPrimaryRef"
      :collection="collection"
    />
  </div>
  <div class="field">
    <div class="type-label">Secondary Label</div>
    <v-collection-field-template
      v-model="labelSecondaryRef"
      :collection="collection"
    />
  </div>
  <div class="field">
    <div class="type-label">Right Label</div>
    <v-collection-field-template
      v-model="labelRightRef"
      :collection="collection"
    />
  </div>
  <div class="field">
    <div class="type-label">Indentation</div>
    <v-select
      v-model="indentationRef"
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
