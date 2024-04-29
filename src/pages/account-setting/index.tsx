// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Card, CardBody, Link, Tab, Tabs } from '@nextui-org/react';
import { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';
import { isAddress } from 'viem';
import { useAccount } from 'wagmi';

import RecoveryImg from '@mimir-wallet/assets/images/recover.svg';
import { Button } from '@mimir-wallet/components';
import { useDelayModules, useMultisig, useQueryParam } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { addressEq } from '@mimir-wallet/utils';

import Recovery from './recovery';
import Setup from './Setup';
import SpendLimit from './spend-limit';

function AccountSetting() {
  const navigate = useNavigate();
  const [tab, setTab] = useQueryParam('tab', 'setup', { replace: true });
  const { current: address } = useContext(AddressContext);
  const [delayModules] = useDelayModules(address);
  const { address: account } = useAccount();
  const [recoveryOpen, toggleRecovery] = useToggle(true);

  const recoveryInfo = useMemo(
    () =>
      account && delayModules.length > 0
        ? delayModules.find((item) => item.modules.findIndex((item) => addressEq(item, account)) > -1)
        : null,
    [account, delayModules]
  );

  const multisig = useMultisig(address);

  if (!address || !isAddress(address)) return null;

  if (recoveryOpen && recoveryInfo) {
    return (
      <div className='max-w-lg mx-auto space-y-5'>
        <Button onClick={toggleRecovery} variant='bordered' color='primary' radius='full'>
          Back
        </Button>
        <Card>
          <CardBody className='py-20 px-10 space-y-4 flex flex-col items-center text-foreground'>
            <img width={112} src={RecoveryImg} alt='mimir recovery' />
            <h6 className='font-bold text-small text-center'>Recover this Account</h6>
            <p className='text-tiny text-foreground text-opacity-50 text-center'>
              The connected wallet was chosen as a trusted Recoverer. You can help the owners regain access by resetting
              the Account setup.
            </p>
            <Button as={Link} href={`/reset/${recoveryInfo.address}`} color='primary' radius='full'>
              Recover
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className='max-w-lg mx-auto space-y-5'>
      <Button onClick={() => navigate(-1)} variant='bordered' color='primary' radius='full'>
        Back
      </Button>
      <h6 className='font-bold text-xl'>Wallet Setting</h6>
      <Tabs
        color='primary'
        variant='underlined'
        aria-label='Tabs'
        selectedKey={tab}
        onSelectionChange={(key) => setTab(key.toString())}
        classNames={{
          tabList: ['bg-white', 'shadow-medium', 'rounded-large', 'p-2.5'],
          tabContent: ['text-primary/50', 'font-bold'],
          cursor: ['rounded-medium']
        }}
      >
        <Tab key='setup' title='Setup'>
          <Setup multisig={multisig} />
        </Tab>
        <Tab key='spend-limit' title='Easy Expense'>
          <SpendLimit address={multisig?.address} />
        </Tab>
        <Tab key='recovery' title='Recovery'>
          <Recovery address={multisig?.address} />
        </Tab>
      </Tabs>
    </div>
  );
}

export default AccountSetting;
