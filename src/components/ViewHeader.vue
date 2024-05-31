<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

type TProps = {
  isModifyEnabled: boolean;
  isModifyDirty: boolean;
  isSaving: boolean;
  modifyEnable: () => void;
  modifyDirty: () => void;
  modifyCancel: () => void;
  modifySave: () => void;
  selectMode: boolean;
  dataLength: number;
  selection: (number | string)[];
  dataKeys: string[] | number[];
  showSelect?: ShowSelect;
};

const props = defineProps<TProps>();

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
  <div class="tree-view__header">
    <button
      @click="modifyEnable"
      class="tree-item__button"
      :class="{ active: isModifyEnabled }"
    >
      {{ t("sort") }}
    </button>
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
    <VCheckbox
      v-if="showSelect === 'multiple'"
      :model-value="allItemsSelected"
      :indeterminate="someItemsSelected"
      @update:model-value="onToggleSelectAll"
      :disabled="isModifyEnabled"
    />
  </div>
</template>
