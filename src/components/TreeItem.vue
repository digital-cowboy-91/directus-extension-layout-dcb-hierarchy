<script setup lang="ts">
import { Item } from "@directus/types";
import { toRefs } from "vue";
import { VueDraggableNext as Draggable } from "vue-draggable-next";

type TProps = {
  items: Item[];
  primaryLabel?: string;
  secondaryLabel?: string;
  collection: string;
};

const props = defineProps<TProps>();
const { items, primaryLabel } = toRefs(props);
</script>

<template>
  <Draggable tag="ul" :list="items" :group="{ name: 'pages' }" class="tree">
    <li v-for="item in items" :key="item.id" class="branch">
      <div>
        <render-template
          v-if="primaryLabel"
          :collection="collection"
          :item="item"
          :template="primaryLabel"
        />
        <span v-else>{{ item.id }}</span>
        <render-template
          v-if="secondaryLabel"
          :collection="collection"
          :item="item"
          :template="secondaryLabel"
        />
      </div>
      <TreeItem
        :items="item._children"
        class="dragArea"
        :primaryLabel="primaryLabel"
        :secondaryLabel="secondaryLabel"
        :collection="collection"
      />
    </li>
  </Draggable>
</template>

<style>
.tree,
.tree ul {
  list-style: none;
}

.tree {
  padding-left: 0;
}

.branch {
  padding-left: 1rem;
}

.debug {
  font-size: 10px;
}

.dragArea {
  min-height: 5rem;
  padding: 1rem;
  background-color: rgba(255 255 255 / 0.1);
  border-radius: 1rem;
}
</style>
