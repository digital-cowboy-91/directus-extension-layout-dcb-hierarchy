import { DeepPartial, Field, Item } from "@directus/types";

export type TOptionIndentation = "compact" | "cozy" | "comfortable";

export type TLayoutOptions = {
  labelPrimary: string | null;
  labelRight: string | null;
  labelSecondary: string | null;
  indentation: TOptionIndentation;
  fieldLevel: number | null;
  fieldParentKey: string | number | null;
  fieldSortIndex: number | null;
  fieldSlug: string | null;
  fieldPath: string | null;
};

export type TMandatoryOption = {
  option: string | null;
  required: boolean;
  default: DeepPartial<Field>;
};

export type TMandatoryFields = {
  _level: number | null;
  _parent_key: string | number | null;
  _sort_index: number | null;
  _path: string | null;
};

export type TItem = Item & TMandatoryFields;

export type TVirtualFields = {
  _key: {
    field: string;
    value: string | number;
  };
  _fieldSlug: string | null;
  _children: TItemVirtual[];
  _expand_view: boolean;
};

export type TItemVirtual = TItem & TVirtualFields;
