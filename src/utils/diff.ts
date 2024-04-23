// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

type Diff<T> = {
  add: T[];
  remove: T[];
  change: [T, T][];
};

export function diffArray<T>(oldArr: T[], newArr: T[]): Diff<T> {
  const add: T[] = [];
  const remove: T[] = [];
  const change: [T, T][] = [];

  const copyNew = Array.from(newArr);

  for (const item of oldArr) {
    const newIndex = copyNew.indexOf(item);

    if (newIndex === -1) {
      remove.push(item);
    } else {
      copyNew.splice(newIndex, 1);
    }
  }

  add.push(...copyNew);

  const length = Math.min(remove.length, add.length);

  for (let i = 0; i < length; i++) {
    change.push([remove[i], add[i]]);
  }

  add.splice(0, length);
  remove.splice(0, length);

  return { add, remove, change };
}
