<script setup lang="ts">
import type { ShowSelect } from "@directus/extensions";

import TreeItem from "./components/TreeItem.vue";
import ViewHeader from "./components/ViewHeader.vue";
import MandatoryCard from "./components/MandatoryCard.vue";
import DebugTable from "./components/DebugTable.vue";
import { TItemVirtual } from "./types";
import { computed, ref } from "vue";
import { refresh } from "@directus/sdk";

type TProps = {
  data: TItemVirtual[];
  dataLength: number;
  dataKeys: string[] | number[];
  error?: any;
  loading: boolean;

  labelPrimary?: string;
  labelRight?: string;
  labelSecondary?: string;
  indentation?: "compact" | "cozy" | "comfortable";

  showSelect?: ShowSelect;
  selection: (number | string)[];
  selectMode: boolean;

  collection: string;
  primaryKeyField: any;
  fieldsInCollection: any[];

  missingMandatory: any[];
  hasMandatory: boolean;
  createMandatory: () => void;
  removeMandatory: () => void;

  saveModifications: () => Promise<void>;

  refresh: () => void;
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

const isModifyEnabled = ref<boolean>(false);
const isModifyDirty = ref<boolean>(false);
const isSaving = ref<boolean>(false);

const selected = computed(() => {
  if (props.dataLength > 0 && props.selection.length === props.dataLength)
    return true;
  if (props.selection.length > 0 && props.selection.length < props.dataLength)
    return undefined;
  return false;
});

function onModifyEnable() {
  isModifyEnabled.value = true;
}
async function onModifySave() {
  isSaving.value = true;
  await props.saveModifications();
  isSaving.value = false;

  refreshAndReset();
}
function modifyCancel() {
  refreshAndReset();
}

function refreshAndReset() {
  refresh();
  isModifyEnabled.value = false;
  isModifyDirty.value = false;
}

function onSelectAll() {
  if (!selected.value) {
    props.selection.splice(0, props.selection.length, ...props.dataKeys);
  } else {
    props.selection.splice(0, props.selection.length, ...[]);
  }
}
</script>

<template>
  <div v-if="hasMandatory" class="tree-view">
    <ViewHeader
      v-if="!selectMode"
      :is-enabled="isModifyEnabled"
      :is-dirty="isModifyDirty"
      :is-saving="isSaving"
      :selected="selected"
      @enable="onModifyEnable"
      @save="onModifySave"
      @cancel="modifyCancel"
      @select-all="onSelectAll"
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
