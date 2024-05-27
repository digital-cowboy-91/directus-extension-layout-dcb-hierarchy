<script setup lang="ts">
import { Item } from "@directus/types";
import { toRefs } from "vue";
import { VueDraggableNext as Draggable } from "vue-draggable-next";

type TProps = {
  items: Item[];
  labelPrimary?: string;
  labelSecondary?: string;
  labelRight?: string;
  collection: string;
  isModifyEnabled: boolean;
  navigateToItem: (collection: string, itemId: string) => void;
};

const props = defineProps<TProps>();
const { items, labelPrimary } = toRefs(props);

function toggleBranch(item: Item) {
  item._expand_view = !item._expand_view;
}
</script>

<template>
  <Draggable
    :disabled="!isModifyEnabled"
    :list="items"
    :group="{ name: 'pages' }"
    handle=".tree-view__drag-handle"
  >
    <div
      v-for="item in items"
      :key="item.id"
      class="tree-view__item"
      :data-expanded="item._expand_view"
    >
      <v-list-item
        block
        @click="() => !isModifyEnabled && navigateToItem(collection, item.id)"
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
          :class="{ disabled: !item._children?.length }"
          left
          @click.stop="toggleBranch(item)"
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
        :items="item._children"
        class="tree-view__branch"
        :class="{ 'tree-view__drag-area': isModifyEnabled }"
        :labelPrimary="labelPrimary"
        :labelSecondary="labelSecondary"
        :labelRight="labelRight"
        :collection="collection"
        :navigateToItem="navigateToItem"
        :isModifyEnabled="isModifyEnabled"
      />
    </div>
  </Draggable>
</template>
