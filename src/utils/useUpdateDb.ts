import { useSdk } from "@directus/extensions-sdk";
import { updateItem } from "@directus/sdk";
import { TItem } from "..";
import { ref } from "vue";

export default function useUpdateDb() {
  const client = useSdk();
  const isUpdating = ref(false);
  const error: any = ref(null);

  async function updateList(list: TItem[], collection: string) {
    isUpdating.value = true;
    for (const { id, _level, _parent_id, _sort_index } of list) {
      try {
        await client.request(
          updateItem(collection, id, {
            _level,
            _parent_id,
            _sort_index,
          })
        );
      } catch (err) {
        console.error("updateHierarchy [" + id + "]", err);

        error.value = err;
        isUpdating.value = false;
      }
    }
    isUpdating.value = false;
  }

  return { updateList, isUpdating, error };
}
