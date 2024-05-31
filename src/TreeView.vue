<script setup lang="ts">
import { TTreeItem } from "./types";
import type { ShowSelect } from "@directus/extensions";

import TreeItem from "./components/TreeItem.vue";
import ViewHeader from "./components/ViewHeader.vue";
import MandatoryCard from "./components/MandatoryCard.vue";
import DebugTable from "./components/DebugTable.vue";

type TProps = {
  data: TTreeItem[];
  dataLength: number;
  dataKeys: string[] | number[];
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
  toggleBranch: (item: TTreeItem) => void;
  selectAll: () => void;
  showSelect?: ShowSelect;
  selection: (number | string)[];
  selectMode: boolean;
  sort: any;

  collection: string;
  primaryKeyField: any;
  fieldsInCollection: any[];

  missingMandatory: any[];
  hasMandatory: boolean;
  createMandatory: () => void;
  removeMandatory: () => void;
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
  <div v-if="hasMandatory" class="tree-view">
    <ViewHeader
      v-if="!selectMode"
      v-bind="{
        ...$props,
      }"
    />
    <TreeItem
      v-bind="{
        collection,
        isModifyDirty,
        isModifyEnabled,
        items: props.data,
        labelPrimary,
        labelRight,
        labelSecondary,
        modifyDirty,
        toggleBranch,
        selection,
        selectMode,
        showSelect,
      }"
      :style="{ '--tree-view--indentation': indentSize() }"
    />
  </div>
  <div v-else>
    <MandatoryCard
      v-bind="{
        ...$props,
      }"
    />
  </div>
  <DebugTable
    v-bind="{
      ...$props,
    }"
  />
</template>

<style>
.tree-view {
  padding: var(--content-padding);
}

.tree-view__item {
  margin-bottom: 0.5rem;
}

.tree-view__item > li:hover {
  background-color: var(--theme--background-subdued);
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

.tree-view__header {
  height: var(--theme--form--field--input--height);
  display: flex;
  border-top: 2px solid var(--theme--border-color-subdued);
  border-bottom: 2px solid var(--theme--border-color-subdued);
  margin-bottom: var(--content-padding);
  padding-right: var(--theme--form--field--input--padding);
}

.tree-item__button {
  color: var(--theme--foreground-subdued);
  height: auto;
}

.tree-item__button.active {
  color: var(--theme--primary);
  cursor: initial;
}

.tree-item__button:enabled:hover:not(.active) {
  color: var(--theme--foreground);
}

.tree-item__button:disabled {
  color: var(--theme--foreground-subdued);
}

.tree-view__spacer {
  flex-grow: 1;
}
</style>
