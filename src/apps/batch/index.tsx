// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Link } from '@nextui-org/react';
import { useContext, useRef, useState } from 'react';
import DraggableList from 'react-draggable-list';
import { useLocation } from 'react-router-dom';

import IconAdd from '@mimir-wallet/assets/svg/icon-add.svg?react';
import { Button, SafeTxButton } from '@mimir-wallet/components';
import { useBatchTxs } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';
import { buildMultiSendSafeTx } from '@mimir-wallet/safe';

import BatchItem from './BatchItem';
import EmptyBatch from './EmptyBatch';

function Batch({ onClose }: { onClose?: () => void }) {
  const { current } = useContext(AddressContext);
  const [txs, , deleteTx, setTxs] = useBatchTxs(current);
  const { pathname } = useLocation();
  const [selected, setSelected] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className='w-[30vw] max-w-[440px] min-w-[320px] space-y-5 h-full'>
      {txs.length === 0 ? (
        <EmptyBatch onClose={onClose} />
      ) : (
        <>
          <h4 className='font-bold text-xl'>Batch</h4>
          <Divider />
          <div className='space-y-2.5'>
            <p>Next Batch</p>
            {current && (
              <div ref={containerRef} style={{ touchAction: 'pan-y' }}>
                <DraggableList
                  itemKey='id'
                  list={txs.map((item, index) => ({
                    ...item,
                    index,
                    selected,
                    from: current,
                    onSelected: (state: boolean) =>
                      setSelected((values) => (state ? [...values, item.id] : values.filter((v) => item.id !== v))),
                    onDelete: () => {
                      setSelected((values) => values.filter((v) => v !== item.id));
                      deleteTx([item.id]);
                    }
                  }))}
                  template={BatchItem as any}
                  onMoveEnd={setTxs as any}
                  container={() => containerRef.current}
                />
              </div>
            )}
            <Button
              as={Link}
              href={`/apps/${encodeURIComponent(`mimir://app/transfer?callbackPath=${encodeURIComponent(pathname)}`)}`}
              onClick={onClose}
              color='secondary'
              className='text-foreground'
              fullWidth
              startContent={<IconAdd />}
            >
              Add New Transfer
            </Button>
          </div>
          <Divider />
          <SafeTxButton
            metadata={{ website: 'mimir://app/batch' }}
            isApprove={false}
            isCancel={false}
            address={current}
            buildTx={async (wallet) =>
              buildMultiSendSafeTx(
                wallet.chain,
                txs.filter((item) => selected.includes(item.id)).map((item) => ({ ...item, value: BigInt(item.value) }))
              )
            }
            onSuccess={() => {
              setTxs(txs.filter((tx) => !selected.includes(tx.id)));
              setSelected([]);
            }}
            isToastError
            color='primary'
            fullWidth
            radius='full'
            disabled={selected.length === 0}
            onOpenTx={onClose}
          >
            Confirm Batch
          </SafeTxButton>
          <Button
            fullWidth
            radius='full'
            disabled={selected.length === 0}
            color='danger'
            variant='bordered'
            onClick={() => {
              setSelected((values) => values.filter((v) => !selected.includes(v)));
              deleteTx(selected);
            }}
          >
            Delete
          </Button>
        </>
      )}
    </div>
  );
}

export default Batch;
