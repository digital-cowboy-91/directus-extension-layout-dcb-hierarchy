import { Item } from "@directus/types";

export type TOptionLabel = string | null;
export type TOptionIndentation = "compact" | "cozy" | "comfortable";

export type TLayoutOptions = {
  labelPrimary?: TOptionLabel;
  labelRight?: TOptionLabel;
  labelSecondary?: TOptionLabel;
  indentation: TOptionIndentation;
};

export type TMandatoryFields = {
  _level: number | null;
  _parent_key: string | number | null;
  _sort_index: number | null;
};

export type TItem = Item & TMandatoryFields;

export type TVirtualFields = {
  _key: {
    field: string;
    value: string | number;
  };
  _children: TItemVirtual[];
  _expand_view: boolean;
};

export type TItemVirtual = TItem & TVirtualFields;
