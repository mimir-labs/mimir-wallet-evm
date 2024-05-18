// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Route, Routes } from 'react-router-dom';

import BaseContainer from './container/BaseContainer';
import PageAccountSetting from './pages/account-setting';
import PageAddressBook from './pages/address-book';
import PageApps from './pages/apps';
import PageAppExplorer from './pages/apps/app-explorer';
import PageAssets from './pages/assets';
import PageCreateMultisig from './pages/create-multisig';
import PageProfile from './pages/profile';
import PageReset from './pages/reset';
import PageTransactions from './pages/transactions';

function App(): React.ReactElement {
  return (
    <Routes>
      <Route element={<BaseContainer withPadding withSideBar />}>
        <Route index element={<PageProfile />} />
        <Route path='/assets' element={<PageAssets />} />
        <Route path='/apps' element={<PageApps />} />
        <Route path='/transactions' element={<PageTransactions />} />
        <Route path='/address-book' element={<PageAddressBook />} />
        <Route path='/account-setting' element={<PageAccountSetting />} />
        <Route path='/reset/:delayAddress' element={<PageReset />} />
      </Route>
      <Route element={<BaseContainer withPadding withSideBar={false} />}>
        <Route path='/create-multisig' element={<PageCreateMultisig />} />
      </Route>
      <Route element={<BaseContainer withSideBar={false} withPadding={false} />}>
        <Route path='/apps/:url' element={<PageAppExplorer />} />
      </Route>
    </Routes>
  );
}

export default App;
