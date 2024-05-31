<script setup lang="ts">
import type { ShowSelect } from "@directus/extensions";
import { VueDraggableNext as Draggable } from "vue-draggable-next";
import { TTreeItem } from "../types";
import { useRouter } from "vue-router";

type TProps = {
  collection: string;
  isModifyDirty: boolean;
  isModifyEnabled: boolean;
  items: TTreeItem[] | undefined;
  labelPrimary?: string;
  labelRight?: string;
  labelSecondary?: string;
  modifyDirty: () => void;
  toggleBranch: (item: TTreeItem) => void;
  showSelect?: ShowSelect;
  selection: (number | string)[];
  selectMode: boolean;
};

const { selection, showSelect } = defineProps<TProps>();
const router = useRouter();

defineEmits(["item-selected"]);

function handleSelection(key: string | number) {
  const index = selection.indexOf(key);

  if (showSelect === "one") {
    console.log("HIT");

    selection.splice(0, selection.length, key);

    console.log(selection);

    return;
  }

  if (index > -1) {
    selection.splice(index, 1);
  } else {
    selection.push(key);
  }
}
</script>

<template>
  <Draggable
    :disabled="!isModifyEnabled"
    :list="items"
    :group="{ name: 'pages' }"
    handle=".tree-view__drag-handle"
    :move="modifyDirty"
  >
    <div
      v-for="item in items"
      :key="item._key.value"
      class="tree-view__item"
      :data-expand="item._expand_view"
    >
      <v-list-item
        block
        :clickable="!isModifyEnabled && !selectMode"
        @click="
          () =>
            !isModifyEnabled &&
            !selectMode &&
            router.push(`/content/${collection}/${item._key.value}`)
        "
      >
        <v-icon
          v-if="isModifyEnabled"
          name="drag_handle"
          class="tree-view__drag-handle"
          left
          @click.stop="() => {}"
        />
        <v-icon
          name="arrow_right"
          class="tree-view__expand-icon"
          :class="{ disabled: !item._children?.length && !isModifyEnabled }"
          left
          @click.stop="
            (item._children?.length || isModifyEnabled) && toggleBranch(item)
          "
        />

        <div>
          <render-template
            v-if="labelPrimary"
            :collection="collection"
            :item="item"
            :template="labelPrimary"
          />
          <render-template
            v-if="labelSecondary"
            class="tree-view__label-secondary"
            :collection="collection"
            :item="item"
            :template="labelSecondary"
          />
        </div>
        <div class="tree-view__spacer" />
        <render-template
          v-if="labelRight"
          :collection="collection"
          :item="item"
          :template="labelRight"
        />
        <v-checkbox
          :icon-on="showSelect === 'one' ? 'radio_button_checked' : undefined"
          :icon-off="
            showSelect === 'one' ? 'radio_button_unchecked' : undefined
          "
          :model-value="selection.includes(item._key.value)"
          @update:model-value="handleSelection(item._key.value)"
          :disabled="isModifyEnabled"
        />
      </v-list-item>
      <TreeItem
        v-bind="{ ...$props, items: item._children }"
        class="tree-view__branch"
        :class="{ 'tree-view__drag-area': isModifyEnabled }"
      />
    </div>
  </Draggable>
</template>
