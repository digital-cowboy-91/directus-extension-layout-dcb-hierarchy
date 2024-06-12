<script setup lang="ts">
import type { ShowSelect } from "@directus/extensions";
import { VueDraggableNext as Draggable } from "vue-draggable-next";
import { useRouter } from "vue-router";
import { TItemVirtual } from "../types";
import { computed, toRefs } from "vue";

type TProps = {
  collection: string;
  items: TItemVirtual[];
  modifyMode: boolean;
  labelPrimary?: string;
  labelRight?: string;
  labelSecondary?: string;

  showSelect?: ShowSelect;
  selection: (number | string)[];
  selectMode: boolean;
};

const props = defineProps<TProps>();
const { selection, showSelect, collection, modifyMode, selectMode } =
  toRefs(props);
const emit = defineEmits(["dirty", "select-one"]);
const router = useRouter();

const notInMode = computed(() => !modifyMode.value && !selectMode.value);

function toggleBranch(item: TItemVirtual) {
  item._expand_view = !item._expand_view;
}

function navigateTo(itemKey: string | number) {
  router.push(`/content/${collection.value}/${itemKey}`);
}
</script>

<template>
  <Draggable
    :disabled="!modifyMode"
    :list="items"
    :group="{ name: 'pages' }"
    handle=".tree-view__drag-handle"
    :move="() => emit('dirty')"
  >
    <div
      v-for="item in items"
      :key="item._key.value"
      class="tree-view__item"
      :data-expand="item._expand_view"
    >
      <VListItem
        block
        :clickable="notInMode"
        @click="() => notInMode && navigateTo(item._key.value)"
      >
        <VIcon
          v-if="modifyMode"
          name="drag_handle"
          class="tree-view__drag-handle"
          left
          @click.stop="() => {}"
        />
        <button
          class="tree-view__button-expand"
          @click.stop="toggleBranch(item)"
          :disabled="!item._children?.length && !modifyMode"
        >
          <v-icon name="chevron_right" />
        </button>
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
        <VCheckbox
          v-if="!modifyMode"
          :icon-on="showSelect === 'one' ? 'radio_button_checked' : undefined"
          :icon-off="
            showSelect === 'one' ? 'radio_button_unchecked' : undefined
          "
          :model-value="selection.includes(item._key.value)"
          @update:model-value="() => emit('select-one', item._key.value)"
        />
      </VListItem>
      <TreeItem
        v-bind="{ ...$props, items: item._children }"
        @dirty="emit('dirty')"
        @select-one="emit('select-one', $event)"
        class="tree-view__branch"
        :class="{ 'tree-view__drag-area': modifyMode }"
      />
    </div>
  </Draggable>
</template>

<style>
.tree-view {
  padding: var(--content-padding);
}

.tree-view__item {
  margin-bottom: 0.5rem;
}

.tree-view__item > li {
  gap: 1rem;
}

.tree-view__button-expand:disabled {
  color: var(--theme--foreground-subdued);
  cursor: not-allowed;
  /* opacity: 0; */
}

.tree-view__button-expand > .v-icon {
  transition: var(--fast) var(--transition);
}

.tree-view__item[data-expand="true"] > li .tree-view__button-expand > .v-icon {
  transform: rotate(90deg);
}

.tree-view__item[data-expand="false"] .tree-view__branch {
  display: none;
}

.tree-view__drag-area {
  min-height: var(--theme--form--field--input--height);
  padding: 0.5rem;
  padding-right: 0;
  border-radius: var(--theme--border-radius);
}

body.light .tree-view__drag-area {
  background-color: rgba(0 0 0 / 0.1);
}

body.body .tree-view__drag-area {
  background-color: rgba(255 255 255 / 0.1);
}

.tree-view__drag-handle {
  cursor: grab;
}

.tree-view__label-secondary {
  font-size: 0.8rem;
  color: var(--theme--foreground-subdued);
}
.tree-view__branch {
  margin-top: 0.5rem;
  margin-left: var(--tree-view--indentation);
}
</style>
../utils/types
