// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContext } from 'react';

import { AddressContext } from '@mimir-wallet/providers';

import Dashboard from './dashboard';
import Welcome from './Welcome';

function Profile() {
  const { current } = useContext(AddressContext);

  return current ? <Dashboard key={current} address={current} /> : <Welcome />;
}

export default Profile;
