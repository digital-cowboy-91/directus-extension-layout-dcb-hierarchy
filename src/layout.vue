<script setup lang="ts">
import { toRefs } from "vue";
import TreeItem from "./components/TreeItem.vue";
import { TItem } from "./index";

type TProps = {
  collection: string;
  data: TItem[];
  loading: boolean;
  error?: any;
  onSave: () => void;
};

const props = defineProps<TProps>();
const { data, loading } = toRefs(props);
</script>

<template>
  <div>Collection: {{ collection }}</div>
  <div v-if="loading">Loading...</div>
  <div v-else>
    <button @click="onSave">Save</button>
    <TreeItem :items="data" />
  </div>
</template>
