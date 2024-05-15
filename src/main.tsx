// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './index.css';

import dayjs from 'dayjs';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';

import Providers from './providers/providers';
import App from './App';
import { initializeFavoriteApps, initMimirConfig } from './config';

dayjs.extend((_, dayjsClass) => {
  const oldFormat = dayjsClass.prototype.format;

  dayjsClass.prototype.format = function format(formatString) {
    return oldFormat.bind(this)(formatString ?? 'YYYY-MM-DD HH:mm:ss');
  };
});
registerSW();
initializeFavoriteApps();

const mimirConfig = initMimirConfig();

const container = document.querySelector('#root');

if (container) {
  const root = createRoot(container);

  root.render(
    <StrictMode>
      <BrowserRouter>
        <Providers address={mimirConfig.address} config={mimirConfig.walletConfig}>
          <App />
        </Providers>
      </BrowserRouter>
    </StrictMode>
  );
}
