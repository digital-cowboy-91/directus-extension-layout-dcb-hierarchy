<script setup lang="ts">
import { useSync } from "@directus/extensions-sdk";
import { Field } from "@directus/types";
import { ComputedRef, computed, ref, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import { TLayoutOptions } from "./utils/types";

const { t } = useI18n();

type TProps = {
  collection: string;
  fieldSlugs: Field[];
  userIsAdmin: boolean;
  fieldsInCollection: ComputedRef<Field[]>;
} & TLayoutOptions;

const props = defineProps<TProps>();
const { fieldsInCollection } = toRefs(props);

const activeTab = ref([0]);

const emit = defineEmits([
  "update:labelPrimary",
  "update:labelSecondary",
  "update:labelRight",
  "update:indentation",
  "update:fieldLevel",
  "update:fieldParentKey",
  "update:fieldSortIndex",
  "update:fieldSlug",
  "update:fieldPath",
  "update:fieldGroup"
]);

const labelPrimarySync = useSync(props, "labelPrimary", emit);
const labelSecondarySync = useSync(props, "labelSecondary", emit);
const labelRightSync = useSync(props, "labelRight", emit);
const indentationSync = useSync(props, "indentation", emit);

const fieldLevelSync = useSync(props, "fieldLevel", emit);
const fieldParentKeySync = useSync(props, "fieldParentKey", emit);
const fieldSortIndexSync = useSync(props, "fieldSortIndex", emit);
const fieldSlugSync = useSync(props, "fieldSlug", emit);
const fieldPathSync = useSync(props, "fieldPath", emit);
const fieldGroupSync = useSync(props, "fieldGroup", emit)

const fieldsWithSlug = computed(() =>
  fieldsInCollection.value.filter((item) => item.meta?.options?.slug)
);

const fieldsWithIntType = computed(() =>
  fieldsInCollection.value.filter((item) => item.type === "integer")
);

const fieldsWithStringType = computed(() =>
  fieldsInCollection.value.filter((item) => item.type === "string")
);

const fieldsWithM2O = computed(() =>
  fieldsInCollection.value.filter((item) => item.meta?.special?.includes("m2o"))
);

const fieldsWithSelect = computed(() => 
fieldsInCollection.value.filter((item) => item.meta?.interface === "select-dropdown")
)

</script>

<template>
  <VTabs v-model="activeTab" class="tree-view__tabs">
    <VTab> View </VTab>
    <VTab :disabled="!userIsAdmin"> Configuration </VTab>
  </VTabs>
  <VTabsItems :model-value="activeTab" class="tree-view__tab-items">
    <VTabItem>
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
    </VTabItem>
    <VTabItem>
      <div class="field">
        <div class="type-label">Level</div>
        <v-select
          v-model="fieldLevelSync"
          item-value="field"
          item-text="name"
          :items="fieldsWithIntType"
          show-deselect
        />
      </div>
      <div class="field">
        <div class="type-label">Parent Key</div>
        <v-select
          v-model="fieldParentKeySync"
          item-value="field"
          item-text="name"
          :items="fieldsWithM2O"
          show-deselect
        />
      </div>
      <div class="field">
        <div class="type-label">Sort Index</div>
        <v-select
          v-model="fieldSortIndexSync"
          item-value="field"
          item-text="name"
          :items="fieldsWithIntType"
          show-deselect
        />
      </div>
      <div class="field">
        <div class="type-label">Slug</div>
        <v-select
          v-model="fieldSlugSync"
          item-value="field"
          item-text="name"
          :items="fieldsWithSlug"
          show-deselect
        />
      </div>
      <div v-if="fieldSlugSync !== null" class="field">
        <div class="type-label">Path</div>
        <v-select
          v-model="fieldPathSync"
          item-value="field"
          item-text="name"
          :items="fieldsWithStringType"
          show-deselect
        />
      </div>
      <div class="field">
        <div class="type-label">Group</div>
        <v-select
          v-model="fieldGroupSync"
          item-value="field"
          item-text="name"
          :items="fieldsWithSelect"
          show-deselect
          :disabled="fieldsWithSelect.length === 0"
        />
      </div>
    </VTabItem>
  </VTabsItems>
</template>

<style>
.tree-view__tabs,
.tree-view__tab-items {
  grid-column: start / full;
}
</style>
