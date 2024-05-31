<script setup lang="ts">
type TProps = {
  missingMandatory: any[];
  createMandatory: () => void;
};

defineProps<TProps>();
</script>
<template>
  <VCard :style="{ margin: 'auto' }">
    <VCardTitle> Action Required </VCardTitle>
    <VCardText>
      <p>
        This extension needs to create following fields in you collection to
        work properly:
      </p>
      <br />
      <ul>
        <li v-for="item in missingMandatory">
          {{ item.field }}
        </li>
      </ul>
    </VCardText>
    <VCardActions>
      <VButton @click="createMandatory">Accept</VButton>
    </VCardActions>
  </VCard>
</template>
