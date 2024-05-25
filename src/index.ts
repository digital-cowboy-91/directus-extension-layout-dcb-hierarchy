import {
  defineLayout,
  useItems,
  useSdk,
  useStores,
} from "@directus/extensions-sdk";
import { ref, toRefs } from "vue";
import LayoutComponent from "./layout.vue";
import { updateItem } from "@directus/sdk";

export type TItem = {
  id: string;
  _level: number;
  _parent_id: string | null;
  _sort_index: number;
  _children?: TItem[];
};

export default defineLayout({
  id: "dcb-hierarchy",
  name: "DCB Hierarchy",
  icon: "box",
  component: LayoutComponent,
  slots: {
    options: () => null,
    sidebar: () => null,
    actions: () => null,
  },
  setup(props) {
    const { collection, filter, search } = toRefs(props);
    const client = useSdk();

    createRequiredFields();

    const { items, loading, error } = useItems(collection, {
      sort: ref(["-_level", "_parent_id", "_sort_index"]),
      fields: ref(["id", "title", "_parent_id", "_sort_index", "_level"]),
      limit: ref(-1),
      filter,
      search,
      page: ref(1),
    });

    return { collection, items, loading, error, updateHierarchy };

    async function createRequiredFields() {
      const required = [
        {
          field: "_parent_id",
          type: "string",
        },
        {
          field: "_sort_index",
          type: "integer",
        },
        {
          field: "_level",
          type: "integer",
        },
      ];

      const { useFieldsStore } = useStores();
      const store = useFieldsStore();

      const collectionKey = collection.value;

      for (const { field, type } of required) {
        try {
          const retrieve = await store.getField(collectionKey, field);

          if (!retrieve) {
            await store.createField(collectionKey, { field, type });
          }
        } catch (err) {
          error.value = err;
          console.error("createRequiredFields: " + field, err);
        }
      }
    }

    async function updateHierarchy(list: TItem[]) {
      for (const { id, _level, _parent_id, _sort_index } of list) {
        try {
          await client.request(
            updateItem(collection.value!, id, {
              _level,
              _parent_id,
              _sort_index,
            })
          );
        } catch (err) {
          console.error("updateHierarchy [" + id + "]", err);
        }
      }
    }
  },
});
