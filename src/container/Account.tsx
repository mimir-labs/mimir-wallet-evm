// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Link } from '@nextui-org/react';
import { useContext } from 'react';
import { useToggle } from 'react-use';
import { useAccount, useBalance, useChains } from 'wagmi';

import ArrowRight from '@mimir-wallet/assets/svg/ArrowRight.svg?react';
import IconLink from '@mimir-wallet/assets/svg/icon-link-colored.svg?react';
import IconQrcode from '@mimir-wallet/assets/svg/icon-qrcode-colored.svg?react';
import IconTransfer from '@mimir-wallet/assets/svg/icon-transfer-colored.svg?react';
import {
  AddressCell,
  AddressIcon,
  Button,
  ButtonEnable,
  CopyAddressButton,
  FormatBalance,
  QrcodeAddress
} from '@mimir-wallet/components';
import { AddressContext } from '@mimir-wallet/providers';
import { explorerUrl } from '@mimir-wallet/utils';

function Account({ handleClick }: { handleClick: () => void }) {
  const { isConnected } = useAccount();
  const { current, multisigs } = useContext(AddressContext);
  const { data } = useBalance({ address: current });
  const [chain] = useChains();
  const [isQrOpen, toggleQrOpen] = useToggle(false);

  return (
    <>
      {isConnected ? (
        multisigs.length > 0 ? (
          <div className='p-2.5 space-y-2.5 border-secondary border-1 rounded-medium text-small'>
            <Button
              onClick={handleClick}
              variant='light'
              fullWidth
              color='default'
              className='flex items-center justify-between px-2.5 py-1.5 border-none text-left max-w-full overflow-visible'
              endContent={
                <Button
                  as='div'
                  isIconOnly
                  size='sm'
                  className='p-0 min-w-0 min-h-0 w-6 h-6 border-none'
                  variant='light'
                  onClick={handleClick}
                >
                  <ArrowRight width={14} />
                </Button>
              }
            >
              <AddressCell address={current} iconSize={30} />
            </Button>
            <Divider />
            <div className='flex items-center gap-1'>
              <AddressIcon isToken size={14} />
              <small className='text-opacity-50 text-foreground'>
                <FormatBalance decimals={data?.decimals} showSymbol symbol={data?.symbol} value={data?.value} />
              </small>
            </div>
            <Divider />
            <div className='flex items-center gap-x-1.5 [&>*]:opacity-50 [&>*:hover]:opacity-100 [&>*]:border-none'>
              <Button color='primary' isIconOnly size='tiny' variant='light' onClick={toggleQrOpen}>
                <IconQrcode width={14} />
              </Button>
              <CopyAddressButton size='tiny' colored color='primary' address={current} />
              <Button
                as={Link}
                target='_blank'
                href={current ? explorerUrl('address', chain, current) : undefined}
                color='primary'
                isIconOnly
                size='tiny'
                variant='light'
              >
                <IconLink width={14} />
              </Button>
              <Button
                as={Link}
                href={`/apps/${encodeURIComponent(`mimir://app/transfer`)}`}
                color='primary'
                isIconOnly
                size='tiny'
                variant='light'
              >
                <IconTransfer width={14} />
              </Button>
            </div>
          </div>
        ) : (
          <Button color='primary' as={Link} href='/create-multisig' size='lg' fullWidth>
            Create Multisig
          </Button>
        )
      ) : (
        <>
          <ButtonEnable size='lg' color='primary' fullWidth withConnect>
            Create Multisig
          </ButtonEnable>
          <Divider />
        </>
      )}

      <QrcodeAddress onClose={toggleQrOpen} isOpen={isQrOpen} address={current} />
    </>
  );
}

export default Account;
