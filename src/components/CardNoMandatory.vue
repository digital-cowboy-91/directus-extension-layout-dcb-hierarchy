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
      <VHighlight
        text="To use Tree View layout, select the appropriate fields in Layout Options > Configuration, or click the button below to generate following default fields:"
        :query="['Layout Options > Configuration']"
      />
      <br />
      <ul>
        <li v-for="{ default: { field } } in missingMandatory">
          {{ field }}
        </li>
      </ul>
    </VCardText>
    <VCardActions>
      <VButton @click="createMandatory">Accept</VButton>
    </VCardActions>
  </VCard>
</template>
