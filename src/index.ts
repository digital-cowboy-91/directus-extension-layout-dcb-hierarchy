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
  useStores,
  useSync,
} from "@directus/extensions-sdk";
import { updateItem } from "@directus/sdk";
import { Field, Item } from "@directus/types";
import { ComputedRef, computed, ref, toRefs, watch } from "vue";
import TreeView from "./TreeView.vue";
import Options from "./Options.vue";
import { TItemExtended, TLayoutOptions, TTreeItem } from "./types";

export default defineLayout({
  id: "dcb-hierarchy",
  name: "DCB Hierarchy",
  icon: "box",
  component: TreeView,
  slots: {
    options: Options,
    sidebar: () => null,
    actions: () => null,
  },
  setup(props, { emit }) {
    const { collection, filter, search } = toRefs(props);

    const client = useSdk();

    const { primaryKeyField, fields: fieldsInCollection } =
      useCollection(collection);

    const fieldsStore = useStores().useFieldsStore();

    const {
      missingMandatory,
      hasMandatory,
      sortByMandatory,
      createMandatory,
      removeMandatory,
    } = useMandatoryFields(fieldsInCollection);

    const isModifyEnabled = ref(false);
    const isModifyDirty = ref(false);
    const isSaving = ref(false);

    const layoutOptions = useSync(props, "layoutOptions", emit);

    const { labelPrimary, labelRight, labelSecondary, indentation } =
      useLayoutOptions();

    const { sort, fields, limit, page } = useItemsQuery();
    const {
      items,
      loading,
      error,
      itemCount: dataLength,
      getItems,
    } = useItems(collection, {
      sort,
      fields,
      limit,
      filter,
      search,
      page,
    });

    const data = ref<TTreeItem[]>([]);
    const dataKeys = computed(() =>
      items.value.map((i) => {
        if (!primaryKeyField.value) return null;

        return i[primaryKeyField.value?.field];
      })
    );

    watch(items, () => {
      data.value = dataStructure(items.value);
    });

    return {
      collection,
      data,
      dataLength,
      dataKeys,
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
      primaryKeyField,
      toggleBranch,
      sort,
      fieldsInCollection,

      missingMandatory,
      hasMandatory,
      createMandatory,
      removeMandatory,

      refresh,
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

          console.log("dataDestructure.desctructor");
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
      console.log("RUN updateDbItems");
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

      isSaving.value = false;

      refresh();
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

    function useItemsQuery() {
      const sort = computed<string[]>(() => sortByMandatory.value);
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

      const limit = computed(() => (hasMandatory.value ? -1 : 0));

      const page = ref(1);

      return { sort, fields, limit, page };
    }

    function modifyEnable() {
      isModifyEnabled.value = true;
    }

    function modifyCancel() {
      refresh();
    }

    function toggleBranch(item: TTreeItem) {
      item._expand_view = !item._expand_view;
    }

    function modifyDirty() {
      isModifyDirty.value = true;
    }

    function refresh() {
      console.log("RUN refresh");
      isSaving.value = false;
      isModifyDirty.value = false;
      isModifyEnabled.value = false;

      getItems();
    }

    function useMandatoryFields(fields: ComputedRef<Field[]>) {
      const mandatoryFields = computed(() => {
        if (!collection.value || !primaryKeyField.value) return [];

        const colRef = collection.value;
        const primKeyRef = primaryKeyField.value;

        return [
          {
            collection: colRef,
            field: "_parent_key",
            type: primKeyRef.type,
            schema: {
              foreign_key_column: primKeyRef.field,
              foreign_key_table: colRef,
            },
            meta: {
              hidden: true,
              interface: "select-dropdown-m2o",
              readonly: true,
              special: ["m2o"],
            },
          },
          {
            collection: colRef,
            field: "_sort_index",
            type: "integer",
            meta: {
              hidden: true,
              readonly: true,
            },
          },
          {
            collection: colRef,
            field: "_level",
            type: "integer",
            meta: {
              hidden: true,
              readonly: true,
            },
          },
        ];
      });
      const hasMandatory = ref<boolean>(false);
      const missingMandatory = ref<any[]>([]);
      const sortByMandatory = ref<string[]>([]);

      watch(fields, () => populate(), { immediate: true });

      return {
        mandatoryFields,
        hasMandatory,
        missingMandatory,
        sortByMandatory,
        createMandatory,
        removeMandatory,
      };

      function createMandatory() {
        console.log("createMandatory");
        const collectionKey = collection.value;

        if (!collectionKey) throw new Error("Missing collection");

        for (const item of missingMandatory.value) {
          fieldsStore.createField(item.collection, item);
        }
      }

      function removeMandatory() {
        console.log("removeMandatory");

        for (const item of mandatoryFields.value) {
          fieldsStore.deleteField(item.collection, item.field);
        }
      }

      function populate() {
        missingMandatory.value =
          mandatoryFields.value.filter((item) => !fieldExists(item.field)) ||
          [];
        hasMandatory.value = !missingMandatory.value.length;
        sortByMandatory.value = hasMandatory.value
          ? ["_level", "_parent_key", "_sort_index"]
          : [];

        function fieldExists(name: string) {
          return fields.value.findIndex((item) => item.field === name) !== -1;
        }
      }
    }
  },
});
