// TODO [MEDIUM]: Apply permissions
// TODO [MEDIUM]: Error handling
// TODO [LOW]: Filter, Search
// TODO [LOW]: Groups (e.g. multiple navigations - Navbar, Footer, Sidebar, etc.)
// DAY 2: API GET structure (sitemap)

import {
  defineLayout,
  getFieldsFromTemplate,
  useCollection,
  useItems,
  useSdk,
  useStores,
  useSync,
} from "@directus/extensions-sdk";
import { updateItem } from "@directus/sdk";
import { computed, ref, toRefs, watch } from "vue";
import { useRouter } from "vue-router";
import LayoutComponent from "./layout.vue";
import Options from "./options.vue";
import { TItemExtended, TTreeItem } from "./types";
import { Item } from "@directus/types";

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

    const isModifyEnabled = ref(false);
    const isModifyDirty = ref(false);
    const isSaving = ref(false);

    const data = ref<TTreeItem[]>([]);

    const layoutOptions = useSync(props, "layoutOptions", emit);

    const client = useSdk();
    const router = useRouter();
    const { primaryKeyField } = useCollection(collection);

    const { labelPrimary, labelRight, labelSecondary, indentation } =
      useLayoutOptions();
    const { fields } = useLayoutQuery();

    const { items, loading, error } = useItems(collection, {
      sort: ref(["-_level", "_parent_key", "_sort_index"]),
      fields,
      limit: ref(-1),
      filter,
      search,
      page: ref(1),
    });

    initialize();

    return {
      collection,
      data,
      error,
      indentation,
      isModifyDirty,
      isModifyEnabled,
      isSaving,
      labelPrimary,
      labelRight,
      labelSecondary,
      loading,
      modifyCancel,
      modifyDirty,
      modifyEnable,
      modifySave,
      navigateToItem,
      primaryKeyField,
      toggleBranch,
    };

    function initialize() {
      fieldsCreateRequired();

      watch(items, () => {
        data.value = dataStructure(items.value);
      });
    }

    async function fieldsCreateRequired() {
      const required = [
        {
          field: "_parent_key",
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
          console.error("fieldsCreateRequired: " + field, err);
        }
      }
    }

    function dataStructure(data: Item[]) {
      const primKey = primaryKeyField.value?.field;

      if (!primKey) return [];

      const treeItem: TTreeItem[] = data.map((item) => ({
        ...item,
        _key: {
          field: primKey,
          value: item[primKey],
        },
        _level: item._level || 0,
        _parent_key: item._parent_key || null,
        _sort_index: item._sort_index || null,
        _children: [],
        _expand_view: false,
      }));

      return treeItem.reduce(
        (
          acc: TTreeItem[],
          item: TTreeItem,
          _index: number,
          arr: TTreeItem[]
        ) => {
          if (!item._parent_key) {
            acc.push(item);
          } else {
            const parent = arr.find((i) => i._key.value === item._parent_key);

            if (parent) {
              parent._children = parent._children || [];
              parent._children.push(item);

              parent._expand_view = true;
            }
          }

          return acc;
        },
        []
      );
    }

    function dataDestructure(data: TTreeItem[]) {
      const newData: TItemExtended[] = [];

      const destructor = (
        list: TTreeItem[],
        level: number = 0,
        parentKey: string | number | null = null
      ) => {
        list.forEach((item, index) => {
          newData.push({
            [item._key.field]: item._key.value,
            _level: level,
            _parent_key: parentKey,
            _sort_index: index,
          });

          if (item._children?.length) {
            destructor(item._children, level + 1, item._key.value);
          }
        });
      };

      destructor(data);

      console.log(newData);

      return newData;
    }

    function dataDiff(original: Item[], modified: TItemExtended[]) {
      const toBeUpdated: TItemExtended[] = [];

      const primKey = primaryKeyField.value?.field;

      if (!primKey) return [];

      modified.forEach((m) => {
        const o = original.find((i) => i[primKey] === m[primKey]);

        if (!o) throw new Error(`Item ${m[primKey]} missing in original list`);

        if (
          o._level !== m._level ||
          o._parent_key !== m._parent_key ||
          o._sort_index !== m._sort_index
        ) {
          toBeUpdated.push(m);
        }
      });

      return toBeUpdated;
    }

    async function updateDbItems(list: TItemExtended[]) {
      const primKey = primaryKeyField.value?.field;

      if (!primKey) throw new Error("Missing primary key");

      for (const item of list) {
        const { _level, _parent_key, _sort_index } = item;
        const key = item[primKey];

        try {
          await client.request(
            updateItem(collection.value!, key, {
              _level,
              _parent_key,
              _sort_index,
            })
          );
        } catch (err) {
          console.error("updateDbItems [KEY: " + key + "]", err);
        }
      }
    }

    async function modifySave() {
      isSaving.value = true;
      const destructedTree = dataDestructure(data.value);
      const toBeUpdated = dataDiff(items.value, destructedTree);

      await updateDbItems(toBeUpdated);
      router.go();
    }

    type TLayoutOptions = {
      labelPrimary: string | null;
      labelRight: string | null;
      labelSecondary: string | null;
      indentation: "compact" | "cozy" | "comfortable";
    };

    function useLayoutOptions() {
      const labelPrimary = createViewOption<string | null>(
        "labelPrimary",
        null
      );
      const labelSecondary = createViewOption<string | null>(
        "labelSecondary",
        null
      );
      const labelRight = createViewOption<string | null>("labelRight", null);
      const indentation = createViewOption<string | null>(
        "indentation",
        "cozy"
      );

      return { labelPrimary, labelRight, labelSecondary, indentation };

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
            layoutOptions.value = {
              ...layoutOptions.value,
              [key]: newValue,
            };
          },
        });
      }
    }

    function useLayoutQuery() {
      const fields = computed<string[]>(() => {
        if (!primaryKeyField.value) return [];

        const fieldsFromTemplates: string[] = [
          primaryKeyField.value?.field,
          "_level",
          "_parent_key",
          "_sort_index",
        ];

        if (labelPrimary.value) {
          fieldsFromTemplates.push(
            ...getFieldsFromTemplate(labelPrimary.value)
          );
        }

        if (labelSecondary.value) {
          fieldsFromTemplates.push(
            ...getFieldsFromTemplate(labelSecondary.value)
          );
        }

        if (labelRight.value) {
          fieldsFromTemplates.push(...getFieldsFromTemplate(labelRight.value));
        }

        console.log(fieldsFromTemplates);

        return fieldsFromTemplates;
      });

      return { fields };
    }

    function modifyEnable() {
      isModifyEnabled.value = true;
    }

    function modifyCancel() {
      isModifyEnabled.value = false;
      data.value = dataStructure(items.value);
    }

    function navigateToItem(collection: string, itemKey: string | number) {
      router.push(`/content/${collection}/${itemKey}`);
    }

    function toggleBranch(item: TTreeItem) {
      item._expand_view = !item._expand_view;
    }

    function modifyDirty() {
      isModifyDirty.value = true;
    }
  },
});
