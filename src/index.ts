// TODO BUG_ [MEDIUM]: Relational interface to the same collection shows tree-view layout as well, but select function is not implemented
// TODO FEAT [MEDIUM]: Apply permissions
// TODO FEAT [MEDIUM]: Error handling
// TODO BUG_ [LOW]: Filter by required fields fails - TypeError: Rn.flatMap is not a function
// TODO FEAT [LOW]: Groups (e.g. multiple navigations - Navbar, Footer, Sidebar, etc.)

// DAY 2: API GET structure (sitemap)

import {
  defineLayout,
  getFieldsFromTemplate,
  useCollection,
  useItems,
  useSdk,
  useSync,
} from "@directus/extensions-sdk";
import { createField, createRelation, updateItem } from "@directus/sdk";
import { Item } from "@directus/types";
import { computed, ref, toRefs, watch } from "vue";
import { useRouter } from "vue-router";
import LayoutComponent from "./layout.vue";
import Options from "./options.vue";
import { TItemExtended, TLayoutOptions, TTreeItem } from "./types";

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
    const { primaryKeyField, fields: collectionFields } =
      useCollection(collection);

    const { labelPrimary, labelRight, labelSecondary, indentation } =
      useLayoutOptions();
    const { sort, fields } = useLayoutQuery();

    const { items, loading, error, getItems } = useItems(collection, {
      sort,
      fields,
      limit: ref(-1),
      filter,
      search,
      page: ref(1),
    });

    watch(items, () => {
      data.value = dataStructure(items.value);
    });

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

    function dataStructure(data: Item[]) {
      const primKey = primaryKeyField.value?.field;

      if (!primKey) return [];

      const treeItems: TTreeItem[] = data.map((item) => ({
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

      if (sort.value.length === 0) return treeItems;

      return treeItems.reduce(
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

      destructor(data);

      return newData;

      function destructor(
        list: TTreeItem[],
        level: number = 0,
        parentKey: string | number | null = null
      ) {
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
      }
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

    async function fieldsCreateRequired() {
      const collectionKey = collection.value;

      if (!collectionKey) throw new Error("Missing collection");

      const fields = [
        {
          field: "_parent_key",
          type: primaryKeyField.value?.type,
          schema: {
            foreign_key_column: primaryKeyField.value?.field,
            foreign_key_table: collectionKey,
          },
          meta: {
            hidden: true,
            interface: "select-dropdown-m2o",
            readonly: true,
            special: ["m2o"],
          },
        },
        {
          field: "_sort_index",
          type: "integer",
          meta: {
            hidden: true,
            readonly: true,
          },
        },
        {
          field: "_level",
          type: "integer",
          meta: {
            hidden: true,
            readonly: true,
          },
        },
      ];

      for (const item of fields) {
        try {
          if (fieldExists(item.field)) continue;

          await client.request(createField(collectionKey, item));
          // await store().createField(collectionKey, item);

          if (item.schema && item.schema.foreign_key_table) {
            await client.request(
              createRelation({
                collection: collectionKey,
                field: item.field,
                related_collection: item.schema.foreign_key_table,
              })
            );
          }
        } catch (err) {
          console.error("[fieldsCreateRequired] Field" + item.field, err);
        }
      }
    }

    async function modifySave() {
      isSaving.value = true;

      const destructedTree = dataDestructure(data.value);
      const toBeUpdated = dataDiff(items.value, destructedTree);

      await fieldsCreateRequired();
      await updateDbItems(toBeUpdated);

      isSaving.value = false;

      if (sort.value.length === 0) {
        router.go();
      } else {
        refresh();
      }
    }

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
      const sort = computed<string[]>(() => {
        const sortFields = ["_level", "_sort_index", "_parent_key"];

        for (const item of sortFields) {
          if (!fieldExists(item)) return [];
        }

        return sortFields;
      });

      const fields = computed<string[]>(() => {
        if (!primaryKeyField.value) return [];

        const fieldsFromTemplates: string[] = [
          primaryKeyField.value?.field,
          ...sort.value,
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

        return fieldsFromTemplates;
      });

      return { sort, fields };
    }

    function modifyEnable() {
      isModifyEnabled.value = true;
    }

    function modifyCancel() {
      refresh();
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

    function refresh() {
      isSaving.value = false;
      isModifyDirty.value = false;
      isModifyEnabled.value = false;

      getItems();
    }

    function fieldExists(field: string) {
      return (
        collectionFields.value.findIndex((item) => item.field === field) !== -1
      );
    }
  },
});
