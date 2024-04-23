// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Address, type Hex, hexToNumber, padHex, slice, toHex } from 'viem';

import { SignatureType } from '../types';

function splitSignature(sig: Hex): { r: Hex; s: Hex; v: number } {
  return {
    r: slice(sig, 0, 32),
    s: slice(sig, 32, 64),
    v: hexToNumber(slice(sig, 64, 65))
  };
}

export function getSignatureType(signature: Hex): SignatureType {
  const { v } = splitSignature(signature);

  const _v = Number(v);

  if (_v === 0) {
    return SignatureType.contract_signature;
  }

  if (_v === 1) {
    return SignatureType.approve_hash_signature;
  }

  if (_v > 30) {
    return SignatureType.eoa_signature_without_messagehash;
  }

  return SignatureType.eoa_signature;
}

export class SignatureTree {
  public value: Hex;

  public signer: Address;

  public type: SignatureType;

  public children: SignatureTree[];

  constructor(value: Hex, signer: Address, children: SignatureTree[] = []) {
    this.value = value;
    this.signer = signer;
    this.children = children;
    this.type = getSignatureType(value);
  }

  dynamicBytes(): Hex {
    if (this.type === SignatureType.contract_signature) {
      let bytes: Hex = '0x';
      let parts: Hex = '0x';

      for (const item of [...this.children].sort((l, r) => (l.signer > r.signer ? 1 : -1))) {
        if (item.type === SignatureType.contract_signature) {
          bytes += `${item.value.slice(2, 66)}${padHex(toHex(this.children.length * 65 + (parts.length - 2) / 2), { size: 32 }).slice(2)}${item.value.slice(130, 132)}`;
          const dynamicBytes = item.dynamicBytes().slice(2);

          parts += toHex(dynamicBytes.length / 2, { size: 32 }).slice(2) + dynamicBytes;
        } else {
          bytes += item.value.slice(2);
        }
      }

      return (bytes + parts.slice(2)) as Hex;
    }

    return '0x';
  }
}
