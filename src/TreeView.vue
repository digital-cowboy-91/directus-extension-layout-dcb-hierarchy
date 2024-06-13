<script setup lang="ts">
import type { ShowSelect } from "@directus/extensions";

import { Ref, toRefs } from "vue";
import DebugTable from "./components/DebugTable.vue";
import CardNoMandatory from "./components/CardNoMandatory.vue";
import CardNoPermission from "./components/CardNoPermission.vue";
import TreeItem from "./components/TreeItem.vue";
import ViewHeader from "./components/ViewHeader.vue";
import { TItemVirtual } from "./utils/types";

type TProps = {
  collection: string;

  userIsAdmin: boolean;

  data: TItemVirtual[];
  error?: any;
  loading: boolean;

  labelPrimary?: string;
  labelSecondary?: string;
  labelRight?: string;
  indentSize: string;

  missingMandatory: any[];
  hasMandatory: boolean;
  canReadMandatory: boolean;
  canUpdateMandatory: boolean;
  createMandatory: () => void;
  removeMandatory: () => void;

  userCanRead: boolean;

  isModifyDirty: Ref<boolean>;
  isModifyEnabled: Ref<boolean>;
  isSaving: Ref<boolean>;

  selectedKeysCount: number;
  showSelect?: ShowSelect;
  selection: (number | string)[];
  selectMode: boolean;

  saveModifications: () => Promise<void>;
  selectAll: () => void;
  selectOne: (key: string | number) => void;

  refresh: () => void;
};

const props = defineProps<TProps>();
const {
  data,
  isModifyDirty,
  isModifyEnabled,
  isSaving,
  saveModifications,
  refresh,
  selectedKeysCount,
} = toRefs(props);
</script>

<template>
  <CardNoMandatory
    v-if="userIsAdmin && !hasMandatory"
    v-bind="{
      ...$props,
    }"
  />
  <CardNoPermission v-else-if="!canReadMandatory" />
  <div v-else class="tree-view">
    <ViewHeader
      v-if="!selectMode"
      :modify-mode="isModifyEnabled"
      :is-dirty="isModifyDirty"
      :is-saving="isSaving"
      :selected="selectedKeysCount"
      :can-update="canUpdateMandatory"
      @enable="isModifyEnabled = true"
      @save="saveModifications"
      @cancel="refresh"
      @select-all="selectAll"
    />
    <TreeItem
      @dirty="isModifyDirty = true"
      @select-one="selectOne"
      v-bind="{
        collection,
        items: data,
        modifyMode: isModifyEnabled,
        labelPrimary,
        labelRight,
        labelSecondary,

        selection,
        selectMode,
        showSelect,
      }"
      :style="{ '--tree-view--indentation': indentSize }"
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
./utils/types
