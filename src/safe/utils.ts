// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SignatureResponse } from '@mimir-wallet/hooks/types';

import { addressEq } from '@mimir-wallet/utils';

import { getSignatureType } from './signature';
import { type BaseAccount, type SafeAccount, SignatureType } from './types';

export function approveCounts(account: BaseAccount, signatures: SignatureResponse[], hasSig: boolean): number {
  if (account.type !== 'safe') {
    return hasSig ? 1 : 0;
  }

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
        const _approveCount = approveCounts(subAccount, signature.children || [], true);

        if (_approveCount >= subAccount.threshold) {
          approveCount++;
        }
      }
    }
  }

  return approveCount;
}

export function memberPaths(account: BaseAccount, member: Address): Array<Address[]> {
  const paths: Array<Address[]> = [];

  function dfs(account: BaseAccount, path: Address[]) {
    path.push(account.address);

    // if the accout eq member, push to path
    if (addressEq(member, account.address)) {
      paths.push(path.slice(1));
    } else {
      // traverse the child member of the current account
      for (const child of account.members || []) {
        dfs(child, path);
      }
    }

    path.pop();
  }

  dfs(account, []);

  return paths;
}

export function signaturePaths(signature: SignatureResponse, member: Address): Array<Address[]> {
  const paths: Array<Address[]> = [];

  function dfs(signature: SignatureResponse, path: Address[]) {
    path.push(signature.signature.signer);

    // if the signer eq member, push to path
    if (addressEq(member, signature.signature.signer)) {
      paths.push([...path]);
    } else {
      // traverse the child member of the current account
      for (const child of signature.children || []) {
        dfs(child, path);
      }
    }

    path.pop();
  }

  dfs(signature, []);

  return paths;
}

export function isReadOnly(account: BaseAccount, address: Address): boolean {
  let _readOnly = true;

  if (addressEq(account.address, address)) {
    return false;
  }

  for (const child of account.members || []) {
    _readOnly = isReadOnly(child, address);

    if (!_readOnly) {
      return false;
    }
  }

  return _readOnly;
}
