import {
  defineLayout,
  useItems,
  useSdk,
  useStores,
  useSync,
} from "@directus/extensions-sdk";
import { updateItem } from "@directus/sdk";
import { computed, ref, toRefs, watch } from "vue";
import LayoutComponent from "./layout.vue";
import Options from "./options.vue";

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
    options: Options,
    sidebar: () => null,
    actions: () => null,
  },
  setup(props, { emit }) {
    const { collection, filter, search } = toRefs(props);
    const client = useSdk();

    // fields: ref(["id", "title", "_parent_id", "_sort_index", "_level"]),
    const { items, loading, error } = useItems(collection, {
      sort: ref(["-_level", "_parent_id", "_sort_index"]),
      fields: ref(["*"]),
      limit: ref(-1),
      filter,
      search,
      page: ref(1),
    });

    const data = ref<TItem[]>([]);

    const layoutOptions = useSync(props, "layoutOptions", emit);
    watch(layoutOptions, () => {
      console.log(layoutOptions.value);
    });
    const { primaryLabel, secondaryLabel } = useLayoutOptions();

    initialize();

    return {
      collection,
      data,
      loading,
      error,
      onSave,
      primaryLabel,
      secondaryLabel,
    };

    function initialize() {
      createRequiredFields();

      watch(items, () => {
        data.value = structureData(items.value as TItem[]);
      });
    }

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

    function structureData(data: TItem[]) {
      const newData = data.reduce((acc, item, _index, arr) => {
        if (!item._children || !item._children.length) {
          item._children = [];
        }

        if (!item._parent_id) {
          acc.push(item);
        } else {
          const parent = arr.find((i) => i.id === item._parent_id);

          if (parent) {
            parent._children = parent._children || [];
            parent._children.push(item);
          }
        }

        return acc;
      }, [] as TItem[]);

      return newData;
    }

    function destructureData(data: TItem[]) {
      const newData: TItem[] = [];

      const destructor = (
        list: TItem[],
        level: number = 0,
        parentId: string | null = null
      ) => {
        list.forEach((item, index) => {
          newData.push({
            id: item.id,
            _level: level,
            _parent_id: parentId,
            _sort_index: index,
          });

          if (item._children?.length) {
            destructor(item._children, level + 1, item.id);
          }
        });
      };

      destructor(data);

      return newData;
    }

    function diffData(original: TItem[], modified: TItem[]) {
      const toBeUpdated: TItem[] = [];

      modified.forEach((m) => {
        const o = original.find((i) => i.id === m.id);

        if (!o) throw new Error(`Item ${m.id} missing in original list`);

        if (
          o._level !== m._level ||
          o._parent_id !== m._parent_id ||
          o._sort_index !== m._sort_index
        ) {
          toBeUpdated.push(m);
        }
      });

      return toBeUpdated;
    }

    async function updateDbItems(list: TItem[]) {
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
          console.error("updateDbItems [" + id + "]", err);
        }
      }
    }

    async function onSave() {
      const destructedTree = destructureData(data.value);
      const toBeUpdated = diffData(items.value as TItem[], destructedTree);

      updateDbItems(toBeUpdated);
    }

    type TLayoutOptions = {
      primaryLabel: string | null;
      secondaryLabel: string | null;
    };

    function useLayoutOptions() {
      const primaryLabel = createViewOption<string | null>(
        "primaryLabel",
        null
      );
      const secondaryLabel = createViewOption<string | null>(
        "secondaryLabel",
        null
      );

      return { primaryLabel, secondaryLabel };

      function createViewOption<T>(
        key: keyof TLayoutOptions,
        defaultValue: any
      ) {
        return computed<T>({
          get() {
            return layoutOptions.value?.[key] !== undefined
              ? layoutOptions.value[key]
              : defaultValue;
          },
          set(newValue: T) {
            console.log(newValue);

            layoutOptions.value = {
              ...layoutOptions.value,
              [key]: newValue,
            };
          },
        });
      }
    }
  },
});
