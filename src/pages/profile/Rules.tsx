// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { TokenAllowance } from '@mimir-wallet/features/allowance/types';

import { Link, Tooltip } from '@nextui-org/react';
import { useChainId } from 'wagmi';

import RecoveryImg from '@mimir-wallet/assets/images/recovery.svg';
import SpendLimitImg from '@mimir-wallet/assets/images/spend-limit.svg';
import { Button } from '@mimir-wallet/components';
import { useRecoveryTxs } from '@mimir-wallet/features/delay';

function Cell({ icon, title, desc, button }: { icon: string; title: string; desc: string; button: React.ReactNode }) {
  return (
    <div className='cursor-pointer h-full p-5 shadow-medium rounded-medium bg-background'>
      <div className='flex flex-row items-center gap-5'>
        <img width={32} src={icon} alt='rules' />
        <div className='flex-1'>
          <h4 className='font-bold text-xl'>{title}</h4>
          <p className='text-tiny text-foreground/50 mt-1'>{desc}</p>
        </div>
        {button}
      </div>
    </div>
  );
}

function Rules({
  safeAccount,
  recoverer,
  tokenAllowance
}: {
  safeAccount: Address;
  recoverer?: Address;
  tokenAllowance?: TokenAllowance;
}) {
  const chainId = useChainId();
  const [recoverTxs] = useRecoveryTxs(chainId, safeAccount);

  const recoverButton =
    recoverTxs.length > 0 ? (
      <Tooltip closeDelay={0} content='Please process the ongoing Recovery first' color='warning'>
        <Button disabled color='primary' radius='full' variant='bordered'>
          Recover
        </Button>
      </Tooltip>
    ) : (
      <Button as={Link} href={`/reset/${recoverer}`} color='primary' radius='full' variant='bordered'>
        Recover
      </Button>
    );

  return (
    <div className='grid grid-cols-12 gap-5'>
      {recoverer && (
        <div className='col-span-6'>
          <Cell
            icon={RecoveryImg}
            title='Recover this Account'
            desc='The connected wallet was chosen as a trusted Recoverer. You can help the owners regain access by resetting the Account setup'
            button={recoverButton}
          />
        </div>
      )}
      {tokenAllowance && (
        <div className='col-span-6'>
          <Cell
            icon={SpendLimitImg}
            title='Easy Expense'
            desc='The connected wallet have easy expense limit, you can transfer without approvement'
            button={
              <Button
                as={Link}
                href={`/apps/${encodeURIComponent(`mimir://app/transfer?token=${tokenAllowance.token}&callbackPath=${encodeURIComponent('/')}`)}`}
                color='primary'
                radius='full'
                variant='bordered'
              >
                Transfer
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}

export default Rules;
