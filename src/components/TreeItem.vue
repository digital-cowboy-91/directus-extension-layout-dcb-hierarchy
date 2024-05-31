<script setup lang="ts">
import type { ShowSelect } from "@directus/extensions";
import { VueDraggableNext as Draggable } from "vue-draggable-next";
import { TItemVirtual } from "../types";
import { useRouter } from "vue-router";

type TProps = {
  collection: string;
  isModifyDirty: boolean;
  isModifyEnabled: boolean;
  items: TItemVirtual[] | undefined;
  labelPrimary?: string;
  labelRight?: string;
  labelSecondary?: string;
  modifyDirty: () => void;
  showSelect?: ShowSelect;
  selection: (number | string)[];
  selectMode: boolean;
};

const { selection, showSelect } = defineProps<TProps>();
const router = useRouter();

function handleSelection(key: string | number) {
  const index = selection.indexOf(key);

  if (showSelect === "one") {
    selection.splice(0, selection.length, key);
    return;
  }

  if (index > -1) {
    selection.splice(index, 1);
  } else {
    selection.push(key);
  }
}

function toggleBranch(item: TItemVirtual) {
  item._expand_view = !item._expand_view;
}
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
      <VListItem
        block
        :clickable="!isModifyEnabled && !selectMode"
        @click="
          () =>
            !isModifyEnabled &&
            !selectMode &&
            router.push(`/content/${collection}/${item._key.value}`)
        "
      >
        <VIcon
          v-if="isModifyEnabled"
          name="drag_handle"
          class="tree-view__drag-handle"
          left
          @click.stop="() => {}"
        />
        <button
          class="tree-view__button-expand"
          @click.stop="toggleBranch(item)"
          :disabled="!item._children?.length && !isModifyEnabled"
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
          v-if="!isModifyEnabled"
          :icon-on="showSelect === 'one' ? 'radio_button_checked' : undefined"
          :icon-off="
            showSelect === 'one' ? 'radio_button_unchecked' : undefined
          "
          :model-value="selection.includes(item._key.value)"
          @update:model-value="handleSelection(item._key.value)"
        />
      </VListItem>
      <TreeItem
        v-bind="{ ...$props, items: item._children }"
        class="tree-view__branch"
        :class="{ 'tree-view__drag-area': isModifyEnabled }"
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
  background-color: rgba(255 255 255 / 0.1);
  border-radius: var(--theme--border-radius);
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
