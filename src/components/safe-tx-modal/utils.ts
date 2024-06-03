// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SignatureResponse } from '@mimir-wallet/hooks/types';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import { randomBytes } from 'crypto';
import { padHex, toHex } from 'viem';

import { approveCounts, SignatureTree } from '@mimir-wallet/safe';
import { addressEq, assert } from '@mimir-wallet/utils';

// @internal
function _createSigTree(sigResponse: SignatureResponse): SignatureTree {
  return new SignatureTree(
    sigResponse.signature.signature,
    sigResponse.signature.signer,
    sigResponse.children?.map((item) => _createSigTree(item))
  );
}

export function buildSigTree(signatures: SignatureResponse[], tree: SignatureTree[] = []): SignatureTree[] {
  signatures.forEach((item, index) => {
    tree.push(_createSigTree(item));

    if (item.children) {
      tree[index].children = [];
      buildSigTree(item.children, (tree[index].children ||= []));
    }
  });

  return tree;
}

export function findValidSignature(account: BaseAccount, signatures: SignatureResponse[]): SignatureResponse[] {
  assert(account.type === 'safe' && account.threshold && account.members, 'Not safe account');

  const validSignatures: SignatureResponse[] = [];

  for (const sig of signatures) {
    const member = account.members.find((item) => addressEq(item.address, sig.signature.signer));

    if (member) {
      if (member.type === 'safe') {
        if (member.threshold && sig.children && approveCounts(member, sig.children) >= member.threshold) {
          validSignatures.push(sig);
        }
      } else {
        validSignatures.push(sig);
      }
    }
  }

  return validSignatures;
}

export function nextApproveCounts(
  account: BaseAccount,
  signatures: SignatureResponse[],
  addressChain: Address[]
): number {
  const _signatures: SignatureResponse[] = JSON.parse(JSON.stringify(signatures));

  let mapSigs = _signatures;

  for (let i = 0; i < addressChain.length; i++) {
    const address = addressChain[i];

    let sub = mapSigs.find((item) => addressEq(address, item.signature.signer));

    if (!sub) {
      sub = {
        uuid: '',
        isStart: i === addressChain.length - 1,
        createdAt: Date.now(),
        signature: {
          signer: address,
          signature:
            i === addressChain.length - 1
              ? `${toHex(randomBytes(64))}1b`
              : padHex(padHex(address, { dir: 'left', size: 32 }), { dir: 'right', size: 65 })
        },
        children: []
      };
      mapSigs.push(sub);
    }

    if (!sub.children) {
      sub.children = [];
    }

    mapSigs = sub.children;
  }

  return approveCounts(account, _signatures);
}
