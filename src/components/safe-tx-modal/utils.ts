// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SignatureResponse } from '@mimir-wallet/hooks/types';

import { SignatureTree } from '@mimir-wallet/safe';

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
