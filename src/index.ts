// TODO FEAT [MEDIUM]: Error handling
// TODO BUG_ [MEDIUM]: Tree View preset not used when in Select Mode
// TODO BUG_ [LOW]: Filter by required fields fails - TypeError: Rn.flatMap is not a function
// TODO FEAT [LOW]: Groups (e.g. multiple navigations - Navbar, Footer, Sidebar, etc.)

// DAY 2 [HIGH]: API GET structure (sitemap)
// DAY 2 [MEDIUM]: Automatically populate values on field creation
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
import { DeepPartial, Relation } from "@directus/types";
import { computed, ref, toRefs, watch } from "vue";
import Options from "./Options.vue";
import TreeView from "./TreeView.vue";
import {
  dataDestructure,
  dataDiff,
  dataStructure,
} from "./utils/dataProcessor";
import {
  TItem,
  TItemVirtual,
  TLayoutOptions,
  TMandatoryOption,
} from "./utils/types";

export default defineLayout({
  id: "dcb-treeview",
  name: "DCB TreeView",
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
    const layoutOptions = useSync(props, "layoutOptions", emit);

    const client = useSdk();
    const { primaryKeyField, fields: fieldsInCollection } =
      useCollection(collection);
    const {
      useUserStore,
      useFieldsStore,
      useRelationsStore,
      usePermissionsStore,
    } = useStores();
    const userStore = useUserStore();
    const permissionsStore = usePermissionsStore();
    const fieldsStore = useFieldsStore();
    const relationsStore = useRelationsStore();

    const userIsAdmin = computed(() => userStore.isAdmin || false);

    const {
      labelPrimary,
      labelRight,
      labelSecondary,
      indentation,
      fieldLevel,
      fieldParentKey,
      fieldSortIndex,
      fieldSlug,
      fieldPath,
    } = useLayoutOptions();

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

    const {
      mandatoryFields,
      hasMandatory,
      canReadMandatory,
      canUpdateMandatory,
      missingMandatory,
      sortByMandatory,
      createMandatory,
    } = useMandatoryFields();
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

      data.value = dataStructure(
        primKey,
        fieldSlug.value,
        items.value as TItem[]
      );
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

      userIsAdmin,

      data,
      loading,
      error,

      mandatoryFields,
      missingMandatory,
      hasMandatory,
      canReadMandatory,
      canUpdateMandatory,
      createMandatory,

      labelPrimary,
      labelRight,
      labelSecondary,
      indentation,
      fieldLevel,
      fieldParentKey,
      fieldSortIndex,
      fieldSlug,
      fieldPath,

      indentSize,

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
        const { _level, _parent_key, _sort_index, _path } = item;
        const key = item[primKey];

        try {
          await client.request(
            updateItem(collection.value!, key, {
              _level,
              _parent_key,
              _sort_index,
              _path,
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

      const fieldLevel = createViewOption<string | null>("fieldLevel", null);
      const fieldParentKey = createViewOption<string | null>(
        "fieldParentKey",
        null
      );
      const fieldSortIndex = createViewOption<string | null>(
        "fieldSortIndex",
        null
      );
      const fieldSlug = createViewOption<string | null>("fieldSlug", null);
      const fieldPath = createViewOption<string | null>("fieldPath", null);

      return {
        labelPrimary,
        labelRight,
        labelSecondary,
        indentation,
        fieldLevel,
        fieldParentKey,
        fieldSortIndex,
        fieldSlug,
        fieldPath,
      };

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

        if (fieldSlug.value) {
          fieldsFromTemplates.push(fieldSlug.value);
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

    function useMandatoryFields() {
      const options = computed<TMandatoryOption[]>(() => {
        if (!collection.value || !primaryKeyField.value) return [];

        const colRef = collection.value;
        const primKeyRef = primaryKeyField.value;

        return [
          {
            option: fieldParentKey?.value,
            required: true,
            default: {
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
          },
          {
            option: fieldSortIndex?.value,
            required: true,
            default: {
              collection: colRef,
              field: "_sort_index",
              type: "integer",
              meta: {
                hidden: true,
                readonly: true,
              },
            },
          },
          {
            option: fieldLevel?.value,
            required: true,
            default: {
              collection: colRef,
              field: "_level",
              type: "integer",
              meta: {
                hidden: true,
                readonly: true,
              },
            },
          },
          {
            option: fieldPath?.value,
            required: fieldSlug?.value !== null,
            default: {
              collection: colRef,
              field: "_path",
              type: "string",
              meta: {
                hidden: true,
                readonly: true,
              },
            },
          },
        ];
      });

      const mandatoryFields = computed(
        () => options.value.filter((o) => o.required) || []
      );

      const missingMandatory = computed(() =>
        mandatoryFields.value.filter((o) => !o.option)
      );

      const hasMandatory = computed(() => missingMandatory.value.length === 0);

      const sortByMandatory = computed(() =>
        hasMandatory.value
          ? [fieldLevel.value!, fieldParentKey.value!, fieldSortIndex.value!]
          : []
      );

      const canReadMandatory = computed(
        () => hasMandatory.value && checkPermission("read")
      );
      const canUpdateMandatory = computed(
        () => hasMandatory.value && checkPermission("update")
      );

      watch(
        canReadMandatory,
        (newVal, oldVal) => {
          console.log("canReadMandatory", newVal, oldVal);
        },
        { immediate: true }
      );

      watch(
        canUpdateMandatory,
        (newVal, oldVal) => {
          console.log("canUpdateMandatory", newVal, oldVal);
        },
        { immediate: true }
      );

      return {
        mandatoryFields,
        hasMandatory,
        canReadMandatory,
        canUpdateMandatory,
        missingMandatory,
        sortByMandatory,
        createMandatory,
      };

      async function createMandatory() {
        for (const item of missingMandatory.value.default) {
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

      function checkPermission(
        action: "create" | "read" | "update" | "delete"
      ) {
        if (!collection.value) throw new Error("Missing collection");
        if (userIsAdmin.value) return true;

        const fields =
          permissionsStore.getPermission(collection.value, action)?.fields ||
          [];

        if (fields[0] === "*") return true;

        return mandatoryFields.value.every((o) => fields.includes(o.option));
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
      const index = selection.value.indexOf(key);

      if (showSelect.value === "one") {
        emit("update:selection", [key]);
        return;
      }

      if (index === -1) selection.value.push(key);
    }
  },
});
