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
</script>

<template>
  <Draggable
    :disabled="!isModifyEnabled"
    :list="items"
    :group="{ name: 'pages' }"
    handle=".drag-handle"
  >
    <div v-for="item in items" :key="item.id">
      <v-list-item block>
        <v-icon
          v-if="isModifyEnabled"
          name="drag_handle"
          class="drag-handle"
          left
          @click.stop="() => {}"
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
        class="tree-branch"
        :class="{ dragArea: isModifyEnabled }"
        :labelPrimary="labelPrimary"
        :labelSecondary="labelSecondary"
        :collection="collection"
        :isModifyEnabled="isModifyEnabled"
      />
    </div>
  </Draggable>
</template>

<style>
.tree-branch {
  margin: 0.5rem 0 0.5rem 2.5rem;
}

.dragArea {
  min-height: 5rem;
  padding-bottom: 0.5rem;
  background-color: rgba(255 255 255 / 0.1);
  border-radius: var(--theme--border-radius);
}

.drag-handle {
  cursor: grad;
}
</style>
