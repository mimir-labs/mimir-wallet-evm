// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export function isValidNumber(value: unknown): boolean {
  return !Number.isNaN(Number(value));
}

export function isValidInteger(value: unknown): boolean {
  return isValidNumber(value) && Number.isInteger(value);
}
