// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SignatureResponse } from '@mimir-wallet/hooks/types';
import type { BaseAccount } from '@mimir-wallet/safe/types';

import SignatureOverview from '@mimir-wallet/components/SignatureOverview';

function Signatures({
  safeAccount,
  signatures
}: {
  safeAccount?: BaseAccount | null;
  signatures?: SignatureResponse[];
}) {
  return (
    <div className='flex rounded-small p-2.5 mt-1.5 min-h-[40vh] h-full'>
      {safeAccount && <SignatureOverview account={safeAccount} signatures={signatures} />}
    </div>
  );
}

export default Signatures;
