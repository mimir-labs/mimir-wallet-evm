// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, Badge, Tooltip } from '@nextui-org/react';
import { useContext } from 'react';
import { useToggle } from 'react-use';

import IconWalletConnect from '@mimir-wallet/assets/svg/icon-wallet-connect.svg?react';
import { Button } from '@mimir-wallet/components';
import { WalletConnectModal } from '@mimir-wallet/features/wallet-connect';
import { WalletConnectContext } from '@mimir-wallet/features/wallet-connect/WalletConnectProvider';

function WalletConnect() {
  const { isReady, sessions } = useContext(WalletConnectContext);
  const [isOpen, toggleOpen] = useToggle(false);

  if (!isReady) return null;

  return (
    <>
      <Tooltip placement='bottom' color='default' closeDelay={0} content='Wallet Connect'>
        <Button
          variant='bordered'
          isIconOnly
          className='border-1 border-secondary hover:bg-primary hover:text-primary-foreground'
          color='primary'
          onClick={toggleOpen}
        >
          <Badge
            isInvisible={sessions.length === 0}
            content={
              sessions.length === 1 ? (
                <Avatar src={sessions[0].peer.metadata.icons[0]} style={{ width: 16, height: 16 }} />
              ) : (
                sessions.length
              )
            }
            color='primary'
            placement='bottom-right'
            size='sm'
            classNames={{
              badge: sessions.length === 1 ? ['bg-transparent p-0 border-none'] : []
            }}
          >
            <IconWalletConnect />
          </Badge>
        </Button>
      </Tooltip>
      <WalletConnectModal isOpen={isOpen} onClose={toggleOpen} />
    </>
  );
}

export default WalletConnect;
