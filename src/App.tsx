// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NextUIProvider } from '@nextui-org/react';
import { Route, Routes, useNavigate } from 'react-router-dom';

import BaseContainer from './container/BaseContainer';
import PageCreateMultisig from './pages/create-multisig';
import { AddressProvider, WalletProvider } from './providers';

function App(): React.ReactElement {
  const navigate = useNavigate();

  return (
    <NextUIProvider navigate={navigate}>
      <WalletProvider>
        <AddressProvider>
          <Routes>
            <Route element={<BaseContainer withSideBar />}>
              <Route index element={<>home</>} />
              <Route path='/assets' element={<>assets</>} />
              <Route path='/apps' element={<>apps</>} />
              <Route path='/transactions' element={<>transactions</>} />
              <Route path='/address-book' element={<>address book</>} />
            </Route>
            <Route element={<BaseContainer withSideBar={false} />}>
              <Route path='/create-multisig' element={<PageCreateMultisig />} />
            </Route>
          </Routes>
        </AddressProvider>
      </WalletProvider>
    </NextUIProvider>
  );
}

export default App;
