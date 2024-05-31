<script setup lang="ts">
type TProps = {
  data: TTreeItem[];
  dataLength: number;
  dataKeys: string[] | number[];
  error?: any;
  indentation?: "compact" | "cozy" | "comfortable";
  isModifyEnabled: boolean;
  isModifyDirty: boolean;
  isSaving: boolean;
  labelPrimary?: string;
  labelRight?: string;
  labelSecondary?: string;
  loading: boolean;
  modifyEnable: () => void;
  modifyDirty: () => void;
  modifyCancel: () => void;
  modifySave: () => void;
  toggleBranch: (item: TTreeItem) => void;
  selectAll: () => void;
  showSelect?: ShowSelect;
  selection: (number | string)[];
  selectMode: boolean;
  sort: any;

  collection: string;
  primaryKeyField: any;
  fieldsInCollection: any[];

  missingMandatory: any[];
  hasMandatory: boolean;
  createMandatory: () => void;
  removeMandatory: () => void;
};

const props = defineProps<TProps>();
</script>

<template>
  <table>
    <tbody>
      <tr>
        <th colspan="2">DEBUG</th>
      </tr>
      <tr>
        <td>Collection</td>
        <td>{{ collection }}</td>
      </tr>
      <tr>
        <td>Primary Key</td>
        <td>{{ primaryKeyField?.field }}</td>
      </tr>
      <tr>
        <td>Fields</td>
        <td>{{ fieldsInCollection?.length || null }}</td>
      </tr>
      <tr>
        <td>missingMandatory</td>
        <td>{{ missingMandatory?.length }}</td>
      </tr>
      <tr>
        <td>hasMandatory</td>
        <td>{{ hasMandatory }}</td>
      </tr>
      <tr>
        <td>dataLength</td>
        <td>{{ dataLength }}</td>
      </tr>
      <tr>
        <td>selection</td>
        <td>{{ selection }}</td>
      </tr>
      <tr>
        <td>Add Mandatory</td>
        <td>
          <button @click="createMandatory">_BUTTON_</button>
        </td>
      </tr>
      <tr>
        <td>Remove Mandatory</td>
        <td>
          <button @click="removeMandatory">_BUTTON_</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
