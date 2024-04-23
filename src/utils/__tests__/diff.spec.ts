// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { diffArray } from '../diff';

describe('Diff array', () => {
  it('diff with change and remove', () => {
    const oldArr = [1, 2, 3, 4, 5];
    const newArr = [4, 5, 6];

    const { add, change, remove } = diffArray(oldArr, newArr);

    expect(add).toEqual([]);
    expect(change).toEqual([[1, 6]]);
    expect(remove).toEqual([2, 3]);
  });

  it('diff with change and add', () => {
    const oldArr = [1, 2, 3, 4];
    const newArr = [4, 5, 6, 7, 8];

    const { add, change, remove } = diffArray(oldArr, newArr);

    expect(add).toEqual([8]);
    expect(change).toEqual([
      [1, 5],
      [2, 6],
      [3, 7]
    ]);
    expect(remove).toEqual([]);
  });

  it('diff with change and add', () => {
    const oldArr = [1, 2, 3, 4];
    const newArr = [4, 5, 6, 7];

    const { add, change, remove } = diffArray(oldArr, newArr);

    expect(add).toEqual([]);
    expect(change).toEqual([
      [1, 5],
      [2, 6],
      [3, 7]
    ]);
    expect(remove).toEqual([]);
  });
});
