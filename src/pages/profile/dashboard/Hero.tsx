// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Card, CardBody, Divider, Link } from '@nextui-org/react';
import React, { useContext } from 'react';
import { useToggle } from 'react-use';

import DebankImg from '@mimir-wallet/assets/images/debank.png';
import EtherscanImg from '@mimir-wallet/assets/images/etherscan.svg';
import IconQrcode from '@mimir-wallet/assets/svg/icon-qrcode.svg?react';
import {
  Address as AddressComp,
  AddressIcon,
  AddressName,
  Button,
  CopyAddressButton,
  QrcodeAddress
} from '@mimir-wallet/components';
import { formatDisplay } from '@mimir-wallet/components/FormatBalance';
import { ONE_DAY } from '@mimir-wallet/constants';
import { useCurrentChain, useIsReadOnly, useMediaQuery, useQueryAccount } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { explorerUrl } from '@mimir-wallet/utils';

import FundModal from '../FundModal';

function Hero({ safeAddress, totalUsd }: { safeAddress: Address; totalUsd: string }) {
  const { addWatchOnlyList, watchlist } = useContext(AddressContext);
  const [, chain] = useCurrentChain();
  const [isOpen, toggleOpen] = useToggle(false);
  const [isQrOpen, toggleQrOpen] = useToggle(false);
  const safeAccount = useQueryAccount(safeAddress);
  const isReadOnly = useIsReadOnly(safeAccount);
  const upSm = useMediaQuery('sm');

  const showWatchOnlyButton =
    isReadOnly && safeAccount && safeAccount.type === 'safe' && !watchlist[safeAccount.address];

  const days = safeAccount ? Math.ceil((Date.now() - safeAccount.createdAt) / (ONE_DAY * 1000)) : '--';
  const formatUsd = formatDisplay(totalUsd);

  const buttons = (
    <div className='flex sm:flex-nowrap flex-wrap items-center sm:gap-2.5 gap-2'>
      {showWatchOnlyButton ? (
        <Button
          onClick={() => addWatchOnlyList(safeAddress)}
          variant='bordered'
          color='primary'
          radius='full'
          size='sm'
          style={{ height: 26 }}
        >
          Add to watchlist
        </Button>
      ) : null}
      <Button
        as={Link}
        href={`/apps/${encodeURIComponent(`mimir://app/transfer?callbackPath=${encodeURIComponent('/')}`)}`}
        variant='bordered'
        color='primary'
        radius='full'
        size='sm'
        style={{ height: 26 }}
      >
        Transfer
      </Button>
      <Button onClick={toggleOpen} variant='bordered' color='primary' radius='full' size='sm' style={{ height: 26 }}>
        Fund
      </Button>
    </div>
  );

  return (
    <>
      <Card>
        <CardBody className='w-full sm:p-5 p-4 flex sm:flex-row flex-col sm:items-center items-start justify-between gap-5 leading-[1.2]'>
          <div className='flex items-start gap-5'>
            <AddressIcon address={safeAddress} size={upSm ? 80 : 50} />

            <div className='space-y-2.5'>
              <h1 className='font-extrabold text-[30px]'>
                <AddressName address={safeAddress} />
              </h1>

              <div className='flex items-center gap-1 font-bold text-foreground'>
                <AddressComp address={safeAddress} showFull={upSm} />
                <CopyAddressButton
                  size='tiny'
                  address={safeAddress}
                  color='primary'
                  variant='light'
                  className='opacity-50'
                />
                <Button color='primary' isIconOnly size='tiny' variant='light' onClick={toggleQrOpen}>
                  <IconQrcode style={{ opacity: 0.5 }} />
                </Button>
              </div>

              <div className='flex items-center gap-[5px] text-foreground/50'>
                <span>Mimir Secured {days} Days</span>
                <Link isExternal href={`https://debank.com/profile/${safeAddress}`}>
                  <img style={{ width: 16, borderRadius: '50%' }} src={DebankImg} alt='debank' />
                </Link>
                <Link isExternal href={explorerUrl('address', chain, safeAddress)}>
                  <img style={{ width: 16 }} src={EtherscanImg} alt={chain.blockExplorers?.default.name} />
                </Link>
              </div>

              <Divider style={{ maxWidth: 250, minWidth: 200 }} />

              {buttons}
            </div>
          </div>

          <h1 className='font-bold text-[40px] leading-[1]'>
            $ {formatUsd[0]}
            {formatUsd[1] ? `.${formatUsd[1]}` : ''}
          </h1>
        </CardBody>
      </Card>

      <QrcodeAddress onClose={toggleQrOpen} isOpen={isQrOpen} address={safeAddress} />

      <FundModal safeAddress={safeAddress} isOpen={isOpen} onClose={toggleOpen} />
    </>
  );
}

export default React.memo(Hero);
