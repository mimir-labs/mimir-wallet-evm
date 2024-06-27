// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ReactGA from 'react-ga4';

export function initGa() {
  if (window.location.host === 'safe.mimir.global') ReactGA.initialize('G-8GQYDFDBZ6');
}
