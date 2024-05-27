<script setup lang="ts">
import { Item } from "@directus/types";
import { toRefs } from "vue";
import { VueDraggableNext as Draggable } from "vue-draggable-next";

type TProps = {
  items: Item[];
  labelPrimary?: string;
  labelSecondary?: string;
  collection: string;
  isModifyEnabled: boolean;
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
      <v-list-item block>
        <v-icon
          v-if="isModifyEnabled"
          name="drag_handle"
          class="tree-view__drag-handle"
          left
          @click.stop="() => {}"
        />
        <v-icon
          v-if="item._children?.length > 0"
          name="arrow_right"
          class="tree-view__expand-icon"
          left
          @click="toggleBranch(item)"
        />
        <render-template
          v-if="labelPrimary"
          :collection="collection"
          :item="item"
          :template="labelPrimary"
        />
        <span v-else>{{ item.id }}</span>
        <div class="spacer" />
        <render-template
          v-if="labelSecondary"
          :collection="collection"
          :item="item"
          :template="labelSecondary"
        />
      </v-list-item>
      <TreeItem
        :items="item._children"
        class="tree-view__branch"
        :class="{ 'tree-view__drag-area': isModifyEnabled }"
        :labelPrimary="labelPrimary"
        :labelSecondary="labelSecondary"
        :collection="collection"
        :isModifyEnabled="isModifyEnabled"
      />
    </div>
  </Draggable>
</template>

<style>
.tree-view__item {
  margin-bottom: 0.5rem;
}

.tree-view__item[data-expanded="true"] .tree-view__expand-icon {
  transform: rotate(90deg);
}

.tree-view__item[data-expanded="false"] .tree-view__branch {
  display: none;
}

.tree-view__branch {
  margin-top: 0.5rem;
  margin-left: 2.5rem;
}

.tree-view__drag-area {
  min-height: var(--theme--form--field--input--height);
  padding: 0.5rem;
  padding-right: 0;
  background-color: rgba(255 255 255 / 0.1);
  border-radius: var(--theme--border-radius);
}

.tree-view__drag-handle {
  cursor: grad;
}
</style>
