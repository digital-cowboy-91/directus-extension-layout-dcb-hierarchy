<script setup lang="ts">
import { ref, toRefs, watch } from "vue";
import TreeItem from "./TreeItem.vue";
import { TItem } from "./index";

type TProps = {
  collection: string;
  items: TItem[];
  loading: boolean;
  error?: any;
  updateHierarchy(list: TItem[]): void;
};

const props = defineProps<TProps>();
const { items, loading } = toRefs(props);

const treeData = ref<TItem[]>([]);

watch(items, () => {
  treeData.value = structure(items.value);
});

function structure(data: TItem[]) {
  const newData = data.reduce((acc, item, _index, arr) => {
    if (!item._children || !item._children.length) {
      item._children = [];
    }

    if (!item._parent_id) {
      acc.push(item);
    } else {
      const parent = arr.find((i) => i.id === item._parent_id);

      if (parent) {
        parent._children = parent._children || [];
        parent._children.push(item);
      }
    }

    return acc;
  }, [] as TItem[]);

  console.log("Structure", newData);

  return newData;
}

function destructure(data: TItem[]) {
  const newData: TItem[] = [];

  const destructor = (
    list: TItem[],
    level: number = 0,
    parentId: string | null = null
  ) => {
    list.forEach((item, index) => {
      newData.push({
        id: item.id,
        _level: level,
        _parent_id: parentId,
        _sort_index: index,
      });

      if (item._children?.length) {
        destructor(item._children, level + 1, item.id);
      }
    });
  };

  destructor(data);

  return newData;
}

function diff(original: TItem[], modified: TItem[]) {
  const toBeUpdated: TItem[] = [];

  modified.forEach((m) => {
    const o = original.find((i) => i.id === m.id);

    if (!o) throw new Error(`Item ${m.id} missing in original list`);

    if (
      o._level !== m._level ||
      o._parent_id !== m._parent_id ||
      o._sort_index !== m._sort_index
    ) {
      toBeUpdated.push(m);
    }
  });

  return toBeUpdated;
}

function saveOrder() {
  const destructedTree = destructure(treeData.value);
  const toBeUpdated = diff(items.value, destructedTree);

  console.log("Original", items.value);
  console.log("Modified", destructedTree);
  console.log("TBU", toBeUpdated);

  props.updateHierarchy(toBeUpdated);
}
</script>

<template>
  <div>Collection: {{ collection }}</div>
  <div v-if="loading">Loading...</div>
  <div v-else>
    <button @click="saveOrder">Save</button>
    <TreeItem :items="treeData" />
  </div>
</template>
