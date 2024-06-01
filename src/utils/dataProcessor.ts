import { TItem, TItemVirtual } from "./types";

export function dataStructure(
  primKey: string,
  slugField: string | null,
  data: TItem[]
) {
  const virtItems: TItemVirtual[] = data.map((item) => ({
    ...item,
    _key: {
      field: primKey,
      value: item[primKey],
    },
    _slugField: slugField,
    _level: item._level || 0,
    _parent_key: item._parent_key || null,
    _sort_index: item._sort_index || null,
    _children: [],
    _expand_view: false,
    _path: item._path || null,
  }));

  return virtItems.reduce(
    (
      acc: TItemVirtual[],
      item: TItemVirtual,
      _index: number,
      arr: TItemVirtual[]
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

export function dataDestructure(data: TItemVirtual[]) {
  const newData: TItem[] = [];

  destructor(data);

  return newData;

  function destructor(
    list: TItemVirtual[],
    level: number = 0,
    parentKey: string | number | null = null,
    parentPath: string | null = ""
  ) {
    list.forEach((item, index) => {
      const newPath = item._slugField
        ? `${parentPath}/${item[item._slugField]}`
        : null;

      newData.push({
        [item._key.field]: item._key.value,
        _level: level,
        _parent_key: parentKey,
        _sort_index: index,
        _path: newPath,
      });

      if (item._children?.length) {
        destructor(item._children, level + 1, item._key.value, newPath);
      }
    });
  }
}

export function dataDiff(
  primKey: string,
  original: TItem[],
  modified: TItem[]
) {
  const diff: TItem[] = [];

  modified.forEach((m) => {
    const o = original.find((i) => i[primKey] === m[primKey]);

    if (!o) throw new Error(`Item ${m[primKey]} missing in original list`);

    if (
      o._level !== m._level ||
      o._parent_key !== m._parent_key ||
      o._sort_index !== m._sort_index ||
      o._path !== m._path
    ) {
      diff.push(m);
    }
  });

  return diff;
}
