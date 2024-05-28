<script setup lang="ts">
import { useI18n } from "vue-i18n";
import TreeItem from "./components/TreeItem.vue";
import { TItem } from "./index";

const { t } = useI18n();

type TProps = {
  collection: string;
  data: TItem[];
  error?: any;
  indentation?: "compact" | "cozy" | "comfortable";
  isModifyEnabled: boolean;
  isModifyDirty: boolean;
  isSaving: boolean;
  labelPrimary?: string;
  labelRight?: string;
  labelSecondary?: string;
  loading: boolean;
  modifyEnable: () => void;
  modifyDirty: () => void;
  modifyCancel: () => void;
  modifySave: () => void;
  navigateToItem: (collection: string, itemId: string) => void;
  toggleBranch: (item: TItem) => void;
};

const props = defineProps<TProps>();

const indentSize = () => {
  switch (props.indentation) {
    case "compact":
      return "1rem";
    case "cozy":
      return "3rem";
    case "comfortable":
      return "5rem";
    default:
      return "3rem";
  }
};
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else>
    <v-button v-if="!isModifyEnabled" @click="modifyEnable">{{
      t("sort")
    }}</v-button>
    <v-button
      v-if="isModifyEnabled"
      @click="modifySave"
      :disabled="!isModifyDirty"
      :loading="isSaving"
      >{{ t("save") }}</v-button
    >
    <v-button v-if="isModifyEnabled" @click="modifyCancel">{{
      t("cancel")
    }}</v-button>

    <TreeItem
      v-bind="{
        collection,
        labelPrimary,
        labelRight,
        labelSecondary,
        isModifyEnabled,
        isModifyDirty,
        navigateToItem,
        toggleBranch,
        modifyDirty,
        items: props.data,
      }"
      class="tree-view"
      :style="{ '--tree-view--indentation': indentSize() }"
    />
  </div>
</template>

<style>
.tree-view {
  padding: var(--content-padding);
}

.tree-view__item {
  margin-bottom: 0.5rem;
}

.tree-view__expand-icon.disabled {
  opacity: 0.2;
}

.tree-view__item[data-expand="true"]
  > li
  .tree-view__expand-icon:not(.disabled) {
  transform: rotate(90deg);
}

.tree-view__item[data-expand="false"] .tree-view__branch {
  display: none;
}

.tree-view__branch {
  margin-top: 0.5rem;
  margin-left: var(--tree-view--indentation);
}

.tree-view__label-secondary {
  font-size: 0.8rem;
}

.tree-view__drag-area {
  min-height: var(--theme--form--field--input--height);
  padding: 0.5rem;
  padding-right: 0;
  background-color: rgba(255 255 255 / 0.1);
  border-radius: var(--theme--border-radius);
}

.tree-view__drag-handle {
  cursor: grab;
}
</style>
