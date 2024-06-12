// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar } from '@nextui-org/react';
import { useContext } from 'react';
import { useToggle } from 'react-use';

import IconWalletConnect from '@mimir-wallet/assets/svg/icon-wallet-connect.svg?react';
import { Button } from '@mimir-wallet/components';
import { WalletConnectModal } from '@mimir-wallet/features/wallet-connect';
import { WalletConnectContext } from '@mimir-wallet/features/wallet-connect/WalletConnectProvider';

function WalletConnectCell() {
  const { isReady } = useContext(WalletConnectContext);
  const [isOpen, toggleOpen] = useToggle(false);

  if (!isReady) return null;

  return (
    <>
      <div className='flex items-center justify-between p-5 rounded-large shadow-medium bg-background'>
        <div className='flex-1 flex items-center gap-2.5'>
          <Avatar src='/images/wallet-connect.webp' style={{ width: 40, height: 40 }} />
          <div>
            <h6 className='font-bold text-medium'>Login as Multisig</h6>
            <p className='text-tiny text-[#D9D9D9]'>
              Connect to any other Dapp supports wallet connect. And also you can connect to Mimir.
            </p>
          </div>
        </div>
        <Button
          color='primary'
          endContent={
            <div className='w-4 h-4 rounded-full bg-primary-foreground p-0.5 text-primary'>
              <IconWalletConnect style={{ width: 12, height: 12 }} />
            </div>
          }
          radius='full'
          onClick={toggleOpen}
        >
          Connect to Dapp
        </Button>
      </div>

      <WalletConnectModal isOpen={isOpen} onClose={toggleOpen} />
    </>
  );
}

export default WalletConnectCell;
