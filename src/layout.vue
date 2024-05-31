<script setup lang="ts">
import { useI18n } from "vue-i18n";
import TreeItem from "./components/TreeItem.vue";
import { TTreeItem } from "./types";
import type { ShowSelect } from "@directus/extensions";
import { computed } from "vue";

const { t } = useI18n();

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
  navigateToItem: (collection: string, itemKey: string | number) => void;
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

const emit = defineEmits(["item-selected"]);

const allItemsSelected = computed<boolean>(
  () => props.dataLength > 0 && props.selection.length === props.dataLength
);

const someItemsSelected = computed<boolean>(
  () => props.selection.length > 0 && props.selection.length < props.dataLength
);

function onToggleSelectAll(value: boolean) {
  if (value === true) {
    props.selection.splice(0, props.selection.length, ...props.dataKeys);
  } else {
    props.selection.splice(0, props.selection.length, ...[]);
  }
}
</script>

<template>
  <table>
    <tbody>
      <tr>
        <th colspan="2">DEBUG</th>
      </tr>
      <tr>
        <td>Collection</td>
        <td>{{ collection }}</td>
      </tr>
      <tr>
        <td>Primary Key</td>
        <td>{{ Boolean(primaryKeyField) }}</td>
      </tr>
      <tr>
        <td>Fields</td>
        <td>{{ fieldsInCollection?.length }}</td>
      </tr>
      <tr>
        <td>missingMandatory</td>
        <td>{{ missingMandatory?.length }}</td>
      </tr>
      <tr>
        <td>hasMandatory</td>
        <td>{{ hasMandatory }}</td>
      </tr>
      <tr>
        <td>dataLength</td>
        <td>{{ dataLength }}</td>
      </tr>
      <tr>
        <td>Add Mandatory</td>
        <td>
          <button @click="createMandatory">_BUTTON_</button>
        </td>
      </tr>
      <tr>
        <td>Remove Mandatory</td>
        <td>
          <button @click="removeMandatory">_BUTTON_</button>
        </td>
      </tr>
    </tbody>
  </table>
  <div v-if="hasMandatory" class="tree-view">
    <div v-if="!selectMode" class="tree-view__header">
      <button
        @click="modifyEnable"
        class="tree-item__button"
        :class="{ active: isModifyEnabled }"
      >
        {{ t("sort") }}
      </button>
      <!-- <v-button v-if="!isModifyEnabled" @click="modifyEnable" :icon="true">
        <v-icon name="edit" />
      </v-button> -->
      <div class="tree-view__spacer" />
      <button
        v-if="isModifyEnabled"
        @click="modifySave"
        :disabled="!isModifyDirty || isSaving"
        class="tree-item__button"
      >
        <span v-if="isSaving">
          <v-progress-circular indeterminate />
        </span>
        <span v-else>{{ t("save") }}</span>
      </button>
      <button
        v-if="isModifyEnabled"
        @click="modifyCancel"
        :disabled="isSaving"
        class="tree-item__button"
      >
        {{ t("cancel") }}
      </button>
      <v-checkbox
        v-if="showSelect === 'multiple'"
        :model-value="allItemsSelected"
        :indeterminate="someItemsSelected"
        @update:model-value="onToggleSelectAll"
        :disabled="isModifyEnabled"
      />
    </div>
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
        navigateToItem,
        toggleBranch,
        selection,
        selectMode,
        showSelect,
      }"
      :style="{ '--tree-view--indentation': indentSize() }"
    />
  </div>
  <div v-else>
    <VCard :style="{ margin: 'auto' }">
      <VCardTitle> Action Required </VCardTitle>
      <VCardText>
        <p>
          This extension needs to create following fields in you collection to
          work properly:
        </p>
        <br />
        <ul>
          <li v-for="item in missingMandatory">
            {{ item.field }}
          </li>
        </ul>
      </VCardText>
      <VCardActions>
        <VButton @click="createMandatory">Accept</VButton>
      </VCardActions>
    </VCard>
  </div>
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
