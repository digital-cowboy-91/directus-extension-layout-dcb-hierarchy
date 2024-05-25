<script setup lang="ts">
import { Item } from "@directus/types";
import { toRefs } from "vue";
import { VueDraggableNext as Draggable } from "vue-draggable-next";

type TProps = {
  items: Item[];
};

const props = defineProps<TProps>();
const { items } = toRefs(props);
</script>

<template>
  <Draggable tag="ul" :list="items" :group="{ name: 'pages' }" class="tree">
    <li v-for="item in items" :key="item.id" class="branch">
      <div>
        <div>{{ item.title }}</div>
        <div class="debug">{{ item.id }}</div>
        <div class="debug">
          LEVEL: {{ item._level }}
          | PARENT:
          {{ item._parent_id }}
          | SORT: {{ item._sort_index }}
        </div>
      </div>
      <TreeItem :items="item._children" class="dragArea" />
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
