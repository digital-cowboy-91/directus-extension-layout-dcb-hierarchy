<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

type TProps = {
  selected: boolean | undefined;
  isEnabled: boolean;
  isDirty: boolean;
  isSaving: boolean;
};

defineProps<TProps>();
const emit = defineEmits(["enable", "save", "cancel", "select-all"]);
</script>

<template>
  <div class="tree-view__header">
    <button
      @click="emit('enable')"
      class="tree-item__button"
      :class="{ active: isEnabled }"
    >
      {{ t("sort") }}
    </button>
    <div class="tree-view__spacer" />
    <button
      v-if="isEnabled"
      @click="emit('save')"
      :disabled="!isDirty || isSaving"
      class="tree-item__button"
    >
      <span v-if="isSaving">
        <v-progress-circular indeterminate />
      </span>
      <span v-else>{{ t("save") }}</span>
    </button>
    <button
      v-if="isEnabled"
      @click="emit('cancel')"
      :disabled="isSaving"
      class="tree-item__button"
    >
      {{ t("cancel") }}
    </button>
    <VCheckbox
      :model-value="selected === true"
      :indeterminate="selected === undefined"
      @click="emit('select-all')"
    />
  </div>
</template>

<style>
.tree-view__header {
  height: var(--theme--form--field--input--height);
  display: flex;
  border-top: 2px solid var(--theme--border-color-subdued);
  border-bottom: 2px solid var(--theme--border-color-subdued);
  margin-bottom: var(--content-padding);
  padding-right: var(--theme--form--field--input--padding);
  gap: 1rem;
}
.tree-item__button {
  color: var(--theme--foreground-subdued);
  height: auto;
}

.tree-item__button.active {
  color: var(--theme--primary);
  cursor: initial;
}

.tree-item__button:enabled:hover:not(.active) {
  color: var(--theme--foreground);
}

.tree-item__button:disabled {
  color: var(--theme--foreground-subdued);
  cursor: not-allowed;
}
</style>
