// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './index.css';

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import dayjs from 'dayjs';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import App from './App';
import { initializeFavoriteApps, initMimirConfig, upgradeAddressBook } from './config';
import { initGa } from './initGa';

dayjs.extend((_, dayjsClass) => {
  const oldFormat = dayjsClass.prototype.format;

  dayjsClass.prototype.format = function format(formatString) {
    return oldFormat.bind(this)(formatString ?? 'YYYY-MM-DD HH:mm:ss');
  };
});

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

initializeFavoriteApps();
upgradeAddressBook();

const mimirConfig = initMimirConfig();

const container = document.querySelector('#root');

if (container) {
  const root = createRoot(container);

  root.render(<App config={mimirConfig.walletConfig} />);
}

if (process.env.NODE_ENV === 'production') {
  registerSW();
  initGa();
}
