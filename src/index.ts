// TODO BUG_ [MEDIUM]: Relational interface to the same collection shows tree-view layout as well, but select function is not implemented
// TODO FEAT [MEDIUM]: Apply permissions
// TODO FEAT [MEDIUM]: Error handling
// TODO FEAT [MEDIUM]: Add generate path option from slug
// TODO BUG_ [LOW]: Filter by required fields fails - TypeError: Rn.flatMap is not a function
// TODO FEAT [LOW]: Groups (e.g. multiple navigations - Navbar, Footer, Sidebar, etc.)

// DAY 2 [HIGH]: API GET structure (sitemap)
// DAY 2 [LOW]: _is_dirty indicator

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
import { DeepPartial, Field, Relation } from "@directus/types";
import { ComputedRef, computed, ref, toRefs, watch } from "vue";
import Options from "./Options.vue";
import TreeView from "./TreeView.vue";
import { TItem, TItemVirtual, TLayoutOptions } from "./types";
import {
  dataDestructure,
  dataDiff,
  dataStructure,
} from "./utils/dataProcessor";

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
    const { collection, filter, search, selection, showSelect } = toRefs(props);

    const isModifyEnabled = ref<boolean>(false);
    const isModifyDirty = ref<boolean>(false);
    const isSaving = ref<boolean>(false);

    const client = useSdk();

    const { primaryKeyField, fields: fieldsInCollection } =
      useCollection(collection);

    const { useFieldsStore, useRelationsStore } = useStores();
    const relationsStore = useRelationsStore();
    const fieldsStore = useFieldsStore();

    const {
      missingMandatory,
      hasMandatory,
      sortByMandatory,
      createMandatory,
      removeMandatory,
    } = useMandatoryFields(fieldsInCollection);

    const layoutOptions = useSync(props, "layoutOptions", emit);

    const { labelPrimary, labelRight, labelSecondary, indentation } =
      useLayoutOptions();

    const { sort, fields, limit, page } = useItemsQuery();
    const { items, loading, error, itemCount, getItems } = useItems(
      collection,
      {
        sort,
        fields,
        limit,
        filter,
        search,
        page,
      }
    );

    const data = ref<TItemVirtual[]>([]);
    const dataKeys = computed(() =>
      items.value.map((i) => {
        if (!primaryKeyField.value) return null;

        return i[primaryKeyField.value?.field];
      })
    );
    const dataLength = computed(() => itemCount.value || 0);

    watch(items, () => {
      const primKey = primaryKeyField.value?.field;

      if (!primKey) throw new Error("Missing primary key");

      data.value = dataStructure(primKey, items.value as TItem[]);
    });

    const indentSize = computed(() => {
      switch (indentation.value) {
        case "compact":
          return "1rem";
        case "cozy":
          return "3rem";
        case "comfortable":
          return "5rem";
        default:
          return "3rem";
      }
    });

    const selectedKeysCount = computed<number>(() =>
      dataLength.value === 0
        ? 0
        : selection.value.length === dataLength.value
        ? -1
        : selection.value.length
    );

    return {
      collection,
      primaryKeyField,
      sort,
      fieldsInCollection,

      data,
      loading,
      error,

      missingMandatory,
      hasMandatory,
      createMandatory,
      removeMandatory,

      indentSize,
      labelPrimary,
      labelRight,
      labelSecondary,

      isModifyEnabled,
      isModifyDirty,
      isSaving,

      selectedKeysCount,

      saveModifications,
      selectAll,
      selectOne,

      refresh,
    };

    async function itemsUpdateCollection(list: TItem[]) {
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
          console.error("itemsUpdateCollection [KEY: " + key + "]", err);
        }
      }
    }

    async function saveModifications() {
      isSaving.value = true;
      try {
        const primKey = primaryKeyField.value?.field;

        if (!primKey) throw new Error("Missing primary key");

        const destructedTree = dataDestructure(data.value);
        const toBeUpdated = dataDiff(
          primKey,
          items.value as TItem[],
          destructedTree
        );

        await itemsUpdateCollection(toBeUpdated);
      } catch (err) {
        console.error("saveModifications", err);
      }
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

    function refresh() {
      console.log("refresh");
      isModifyEnabled.value = false;
      isModifyDirty.value = false;
      isSaving.value = false;
      selection.value.splice(0, selection.value.length);

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

      async function createMandatory() {
        const collectionKey = collection.value;

        if (!collectionKey) throw new Error("Missing collection");

        for (const item of missingMandatory.value) {
          const { collection, field, schema } = item;

          fieldsStore.createField(collection, item).then(() => {
            if (!schema?.foreign_key_table) return;

            relationsStore.upsertRelation(collection, field, {
              collection,
              field,
              related_collection: schema.foreign_key_table,
            } as DeepPartial<Relation>);
          });
        }
      }

      function removeMandatory() {
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

    function selectAll() {
      if (!selectedKeysCount.value) {
        selection.value.splice(0, selection.value.length, ...dataKeys.value);
      } else {
        selection.value.splice(0, selection.value.length);
      }
    }

    function selectOne(key: string | number) {
      console.log("selectOne", key);
      const index = selection.value.indexOf(key);

      if (showSelect.value === "one") {
        selection.value.splice(0, selection.value.length, key);
        return;
      }

      if (index === -1) selection.value.push(key);
    }
  },
});
