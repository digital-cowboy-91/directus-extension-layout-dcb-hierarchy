<script setup lang="ts">
import { toRefs } from "vue";
import { VueDraggableNext as Draggable } from "vue-draggable-next";
import { TTreeItem } from "../types";

type TProps = {
  collection: string;
  isModifyDirty: boolean;
  isModifyEnabled: boolean;
  items: TTreeItem[] | undefined;
  labelPrimary?: string;
  labelRight?: string;
  labelSecondary?: string;
  modifyDirty: () => void;
  navigateToItem: (collection: string, itemKey: string | number) => void;
  toggleBranch: (item: TTreeItem) => void;
};

const props = defineProps<TProps>();
const { items, labelPrimary } = toRefs(props);
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
        @click="
          () => !isModifyEnabled && navigateToItem(collection, item._key.value)
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
        <div class="spacer" />
        <render-template
          v-if="labelRight"
          :collection="collection"
          :item="item"
          :template="labelRight"
        />
      </v-list-item>
      <TreeItem
        v-bind="{ ...props, items: item._children }"
        class="tree-view__branch"
        :class="{ 'tree-view__drag-area': isModifyEnabled }"
      />
    </div>
  </Draggable>
</template>
