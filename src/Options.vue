<!-- TODO [MEDIUM]: Max level field -->

<script setup lang="ts">
import { useSync } from "@directus/extensions-sdk";
import { Field } from "@directus/types";
import { useI18n } from "vue-i18n";
import { TLayoutOptions } from "./utils/types";

const { t } = useI18n();

type TProps = {
  collection: string;
  slugFields: Field[];
} & TLayoutOptions;

const props = defineProps<TProps>();

const emit = defineEmits([
  "update:labelPrimary",
  "update:labelSecondary",
  "update:labelRight",
  "update:indentation",
  "update:slugField",
]);

const labelPrimarySync = useSync(props, "labelPrimary", emit);
const labelSecondarySync = useSync(props, "labelSecondary", emit);
const labelRightSync = useSync(props, "labelRight", emit);
const indentationSync = useSync(props, "indentation", emit);
const slugFieldSync = useSync(props, "slugField", emit);
</script>

<template>
  <div class="field">
    <div class="type-label">Primary Label</div>
    <v-collection-field-template
      v-model="labelPrimarySync"
      :collection="collection"
    />
  </div>
  <div class="field">
    <div class="type-label">Secondary Label</div>
    <v-collection-field-template
      v-model="labelSecondarySync"
      :collection="collection"
    />
  </div>
  <div class="field">
    <div class="type-label">Right Label</div>
    <v-collection-field-template
      v-model="labelRightSync"
      :collection="collection"
    />
  </div>
  <div class="field">
    <div class="type-label">Indentation</div>
    <v-select
      v-model="indentationSync"
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
  <div class="field">
    <div class="type-label">Slug Field</div>
    <v-select
      v-model="slugFieldSync"
      item-value="field"
      item-text="name"
      :items="slugFields"
      show-deselect
    />
  </div>
</template>
./utils/types
