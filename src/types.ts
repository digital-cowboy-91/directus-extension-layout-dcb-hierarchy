import { Item } from "@directus/types";

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
