// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Hex, padHex, toHex } from 'viem';

import { SignatureType } from '../types';
import { SignatureTree } from './signature-tree';

export function buildBytesSignatures(signatures: SignatureTree[]): Hex {
  let bytes: Hex = '0x';
  let parts: Hex = '0x';

  for (const signature of [...signatures].sort((l, r) => (l.signer > r.signer ? 1 : -1))) {
    if (signature.type === SignatureType.contract_signature) {
      bytes += `${signature.value.slice(2, 66)}${padHex(toHex(signatures.length * 65 + (parts.length - 2) / 2), { size: 32 }).slice(2)}${signature.value.slice(130, 132)}`;

      const dynamicBytes = signature.dynamicBytes().slice(2);

      parts += toHex(dynamicBytes.length / 2, { size: 32 }).slice(2) + dynamicBytes;
    } else {
      bytes += signature.value.slice(2);
    }
  }

  return (bytes + parts.slice(2)) as Hex;
}
