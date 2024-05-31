<script setup lang="ts">
import type { ShowSelect } from "@directus/extensions";

import TreeItem from "./components/TreeItem.vue";
import ViewHeader from "./components/ViewHeader.vue";
import MandatoryCard from "./components/MandatoryCard.vue";
import DebugTable from "./components/DebugTable.vue";
import { TItemVirtual } from "./types";

type TProps = {
  data: TItemVirtual[];
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
  toggleBranch: (item: TItemVirtual) => void;
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
.tree-view__spacer {
  flex-grow: 1;
}
</style>
