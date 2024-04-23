// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Route, Routes } from 'react-router-dom';

import BaseContainer from './container/BaseContainer';
import PageAccountSetting from './pages/account-setting';
import PageApps from './pages/apps';
import PageCreateMultisig from './pages/create-multisig';
import PageProfile from './pages/profile';
import PageTransactions from './pages/transactions';

function App(): React.ReactElement {
  return (
    <Routes>
      <Route element={<BaseContainer withSideBar />}>
        <Route index element={<PageProfile />} />
        <Route path='/assets' element={<>assets</>} />
        <Route path='/apps' element={<>apps</>} />
        <Route path='/transactions' element={<PageTransactions />} />
        <Route path='/address-book' element={<>address book</>} />
      </Route>
      <Route element={<BaseContainer withSideBar={false} />}>
        <Route path='/create-multisig' element={<PageCreateMultisig />} />
        <Route path='/apps/:url' element={<PageApps />} />
        <Route path='/account-setting' element={<PageAccountSetting />} />
      </Route>
    </Routes>
  );
}

export default App;
