// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BatchTxItem } from '@mimir-wallet/hooks/types';

import { Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import React, { useMemo, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { isHex } from 'viem';

import { Alert, Button, Input } from '@mimir-wallet/components';
import { useCurrentChain, useInput } from '@mimir-wallet/hooks';
import { service } from '@mimir-wallet/utils';

function AddNewCache({
  isOpen,
  onClose,
  onAddTxs
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddTxs: (txs: Omit<BatchTxItem, 'id'>[]) => void;
}) {
  const [chainId] = useCurrentChain();
  const [value, setValue] = useInput('');
  const [error, setError] = useState<Error>();

  const hash = useMemo(() => {
    if (isHex(value) && value.length === 66) {
      return value;
    }

    try {
      const url = new URL(value);
      const hash = url.pathname.split('/tx/')[1]?.slice(0, 66);

      if (hash && isHex(hash) && hash.length === 66) {
        return hash;
      }
    } catch {
      return null;
    }

    return null;
  }, [value]);

  const [state, handleClick] = useAsyncFn(async () => {
    if (!hash) return;

    try {
      const results = await service.parseTx(chainId, hash);

      onAddTxs(results);
      onClose();
    } catch (error) {
      setError(error as Error);
    }
  }, [chainId, hash, onAddTxs, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Add New Transaction</ModalHeader>
        <Divider />
        <ModalBody className='p-5 gap-y-5'>
          <Input
            label='Paste transaction hash/explorer link to create the same in Cache'
            placeholder='Paste transaction hash/explorer link'
            variant='bordered'
            labelPlacement='outside'
            value={value}
            onChange={setValue}
          />
          {error && <Alert severity='error' title={error?.message} />}
        </ModalBody>
        <Divider />
        <ModalFooter>
          <Button
            fullWidth
            color='primary'
            radius='full'
            disabled={!hash}
            isLoading={state.loading}
            onClick={handleClick}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(AddNewCache);
