import { Item } from "@directus/types";

export type TOptionLabel = string | null;
export type TOptionIndentation = "compact" | "cozy" | "comfortable";

export type TLayoutOptions = {
  labelPrimary?: TOptionLabel;
  labelRight?: TOptionLabel;
  labelSecondary?: TOptionLabel;
  indentation: TOptionIndentation;
};

export type TLayoutFields = {
  _level: number;
  _parent_key: string | number | null;
  _sort_index: number;
};

export type TTreeItem = {
  _key: {
    field: string;
    value: string | number;
  };
  _children?: TTreeItem[];
  _expand_view?: boolean;
} & TLayoutFields;

export type TItemExtended = Item & TLayoutFields;
