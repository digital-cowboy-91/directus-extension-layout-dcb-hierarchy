<script setup lang="ts">
type TProps = {
  collection: any;
  userIsAdmin: any;
  canUpdateMandatory: any;
  createMandatory: any;
  removeMandatory: any;
};

defineProps<TProps>();
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
        <td>userIsAdmin</td>
        <td>{{ userIsAdmin }}</td>
      </tr>
      <tr>
        <td>canUpdateMandatory</td>
        <td>{{ canUpdateMandatory }}</td>
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
