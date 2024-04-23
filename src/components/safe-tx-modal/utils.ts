// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SignatureResponse } from '@mimir-wallet/hooks/types';

import { getSignatureType, SignatureTree } from '@mimir-wallet/safe';
import { type BaseAccount, type SafeAccount, SignatureType } from '@mimir-wallet/safe/types';

export function approveCounts(account: BaseAccount, signatures: SignatureResponse[]): number {
  let approveCount = 0;

  for (const signature of signatures) {
    const signatureType = getSignatureType(signature.signature.signature);

    if (signatureType === SignatureType.eoa_signature) {
      approveCount++;
    } else if (signatureType === SignatureType.contract_signature) {
      const subAccount = (account as SafeAccount)?.members?.find(
        (item) => item.address === signature.signature.signer
      ) as SafeAccount | undefined;

      if (subAccount) {
        const _approveCount = approveCounts(subAccount, signature.children || []);

        if (_approveCount >= subAccount.threshold) {
          approveCount++;
        }
      }
    }
  }

  return approveCount;
}

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
