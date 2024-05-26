<script setup lang="ts">
import { toRefs } from "vue";
import TreeItem from "./components/TreeItem.vue";
import { TItem } from "./index";

type TProps = {
  collection: string;
  data: TItem[];
  loading: boolean;
  error?: any;
  labelPrimary?: string;
  labelSecondary?: string;
  isModifyEnabled: boolean;
  modifyEnable: () => void;
  modifyReset: () => void;
  modifySave: () => void;
};

const props = defineProps<TProps>();
const { data, loading, labelPrimary } = toRefs(props);
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else>
    <v-button v-if="!isModifyEnabled" @click="modifyEnable">Arrange</v-button>
    <v-button v-if="isModifyEnabled" @click="modifySave">Save</v-button>
    <v-button v-if="isModifyEnabled" @click="modifyReset">Reset</v-button>
    <TreeItem
      :items="data"
      :labelPrimary="labelPrimary"
      :labelSecondary="labelSecondary"
      :collection="collection"
      :isModifyEnabled="isModifyEnabled"
    />
  </div>
</template>
