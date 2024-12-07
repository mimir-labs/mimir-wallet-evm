// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Checkbox, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tooltip } from '@nextui-org/react';
import { useContext, useMemo } from 'react';
import { useToggle } from 'react-use';
import { Address } from 'viem';
import { useAccount } from 'wagmi';

import RecoveryImg from '@mimir-wallet/assets/images/recover.svg';
import { Button } from '@mimir-wallet/components';
import { IGNORE_RECOVERY_ACCOUNT_KEY } from '@mimir-wallet/constants';
import { useCurrentChain, useLocalStore } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { addressEq } from '@mimir-wallet/utils';

import { useDelayModules } from './useDelayModules';
import { useRecoveryTxs } from './useRecoveryTxs';

function Content({ account, safeAddress }: { account: Address; safeAddress: Address }) {
  const [chainId] = useCurrentChain();
  const [recoverTxs] = useRecoveryTxs(chainId, safeAddress);
  const [delayModules] = useDelayModules(safeAddress);
  const [ignore, setIgnore] = useLocalStore<boolean>(`${IGNORE_RECOVERY_ACCOUNT_KEY}`);
  const [isOpen, toggleOpen] = useToggle(!ignore);

  const recoveryInfo = useMemo(
    () =>
      delayModules.length > 0
        ? delayModules.find((item) => item.modules.findIndex((item) => addressEq(item, account)) > -1)
        : null,
    [account, delayModules]
  );

  if (recoveryInfo) {
    return (
      <Modal isOpen={isOpen} onClose={toggleOpen}>
        <ModalContent>
          <ModalHeader>Recoverer</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-5 justify-center items-center'>
              <img width={112} src={RecoveryImg} alt='mimir recovery' />
              <h6 className='font-bold text-small text-center'>Recover this Account</h6>
              <p className='text-tiny text-foreground text-opacity-50 text-center'>
                The connected wallet was chosen as a trusted Recoverer. You can help the owners regain access by
                resetting the Account setup.
              </p>
            </div>
            <Checkbox
              size='sm'
              isSelected={ignore}
              onValueChange={(state) => {
                toggleOpen(false);
                setIgnore(state);
              }}
            >
              {`Don't show me again`}
            </Checkbox>
          </ModalBody>
          <ModalFooter>
            {recoverTxs.length > 0 ? (
              <Tooltip closeDelay={0} content='Please process the ongoing Recovery first' color='warning'>
                <Button fullWidth color='primary' radius='full' disabled>
                  Recover
                </Button>
              </Tooltip>
            ) : (
              <Button
                onClick={() => toggleOpen(false)}
                as={Link}
                href={`/reset/${recoveryInfo.address}`}
                fullWidth
                color='primary'
                radius='full'
              >
                Recover
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
}

function RecoverModal() {
  const { current } = useContext(AddressContext);
  const { address: account } = useAccount();

  if (current && account) {
    return <Content safeAddress={current} account={account} />;
  }

  return null;
}

export default RecoverModal;
