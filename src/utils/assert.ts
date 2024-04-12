// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export function assert(condition: unknown, message: string | (() => Error)): asserts condition {
  if (!condition) {
    throw typeof message === 'string' ? new Error(message) : message();
  }
}

export function assertReturn<T>(value: T | undefined | null, message: string | (() => Error)): T {
  assert(value !== undefined && value !== null, message);

  return value;
}
