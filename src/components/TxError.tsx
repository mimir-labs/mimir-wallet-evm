// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { BaseError, ContractFunctionExecutionError, ContractFunctionRevertedError } from 'viem';

function TxError({ error }: { error: unknown }) {
  if (error instanceof ContractFunctionExecutionError) {
    return error.shortMessage;
  }

  if (error instanceof BaseError) {
    const revertError = error.walk((err) => err instanceof ContractFunctionRevertedError);

    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName ?? '';

      return `${errorName}(${revertError.data?.args?.toString()})`;
    }

    return error.shortMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Failed!';
}

export default React.memo(TxError);
