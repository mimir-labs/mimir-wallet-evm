// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import AppName from '@mimir-wallet/components/AppName';

function TxApp({ website }: { website?: string }) {
  return <AppName website={website} />;
}

export default React.memo(TxApp);
