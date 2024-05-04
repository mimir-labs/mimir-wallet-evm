// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';

import { Checkbox, Divider } from '@nextui-org/react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { encodeFunctionData, erc721Abi, isAddress } from 'viem';

import { abis } from '@mimir-wallet/abis';
import { Button, ButtonEnable, Empty, NftCard } from '@mimir-wallet/components';
import { useAccountNFTs } from '@mimir-wallet/hooks';
import { SafeContext } from '@mimir-wallet/providers';
import { buildMultiSendSafeTx, getNonce } from '@mimir-wallet/safe';
import { IPublicClient, IWalletClient, MetaTransaction, Operation } from '@mimir-wallet/safe/types';
import { addressEq } from '@mimir-wallet/utils';

function Nfts({ address }: { address: Address }) {
  const { openTxModal } = useContext(SafeContext);
  const [data] = useAccountNFTs(address);
  const navigate = useNavigate();
  const collections = useMemo(
    () =>
      data.assets.reduce<string[]>((results, item) => {
        if (!results.includes(item.collectionName || 'unknown')) {
          results.push(item.collectionName || 'unknown');
        }

        return results;
      }, []),
    [data.assets]
  );
  const [collection, setCollection] = useState<string>();
  const [selected, setSelected] = useState<`${Address}-${string}`[]>([]);

  const _collection = collection || collections[0];

  const list = useMemo(
    () => data.assets.filter((item) => (item.collectionName || 'unknown') === _collection),
    [_collection, data.assets]
  );

  const handleClick = useCallback(
    async (wallet: IWalletClient, client: IPublicClient) => {
      const receive = window.prompt('Receiver');

      if (!receive || !isAddress(receive)) {
        throw new Error('Please input valid address');
      }

      const txs: MetaTransaction[] = [];

      for (const item of selected) {
        const [tokenAddress, tokenId] = item.split('-') as [Address, string];

        const asset = data.assets.find(
          (item) => addressEq(item.contractAddress, tokenAddress) && item.tokenId === tokenId
        );

        if (!asset || asset.contractType === 'UNDEFINED') {
          throw new Error('Unsupport nft type');
        }

        txs.push({
          to: tokenAddress,
          operation: Operation.Call,
          value: 0n,
          data:
            asset.contractType === 'ERC721'
              ? encodeFunctionData({
                  abi: erc721Abi,
                  functionName: 'safeTransferFrom',
                  args: [address, receive, BigInt(tokenId)]
                })
              : encodeFunctionData({
                  abi: abis.ERC1155,
                  functionName: 'safeTransferFrom',
                  args: [address, receive, BigInt(tokenId), asset.quantity ? BigInt(asset.quantity) : 1n, '0x']
                })
        });
      }

      const safeTx = await buildMultiSendSafeTx(wallet.chain, txs, await getNonce(client, address));

      openTxModal(
        {
          website: 'mimir://internal/transfer-nft',
          isApprove: false,
          address,
          safeTx
        },
        () => navigate('/transactions')
      );
    },
    [address, data.assets, navigate, openTxModal, selected]
  );

  if (data.assets.length === 0) {
    return <Empty height='50vh' />;
  }

  return (
    <div className='space-y-5 min-h-full'>
      <div className='flex gap-x-1'>
        {collections.map((item) => (
          <Button
            data-selected={_collection === item}
            className='opacity-50 data-[selected=true]:opacity-100'
            key={item}
            size='sm'
            variant='light'
            onClick={() => setCollection(item)}
          >
            {item || 'none'}
          </Button>
        ))}
      </div>
      <Divider />
      <div className='grid grid-cols-5 gap-5 3xl:grid-cols-7 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-4 sm:grid-cols-3'>
        {list.map((nft) => (
          <div
            className='group relative cursor-pointer col-span-1'
            data-selected={selected.includes(`${nft.contractAddress}-${nft.tokenId}`)}
            key={nft.tokenId + nft.contractAddress}
            onClick={() =>
              setSelected((value) => {
                const id = `${nft.contractAddress}-${nft.tokenId}` as const;

                if (value.includes(id)) {
                  return value.filter((item) => item !== id);
                }

                return [...value, id];
              })
            }
          >
            <Checkbox
              isSelected={selected.includes(`${nft.contractAddress}-${nft.tokenId}`)}
              classNames={{ wrapper: 'bg-white' }}
              className='z-10 absolute top-4 right-2 transition-opacity opacity-0 group-hover:opacity-100 group-data-[selected=true]:opacity-100'
            />
            <NftCard {...nft} />
          </div>
        ))}
      </div>
      {selected.length > 0 && (
        <div className='fixed bottom-0 left-[232px] right-0 w-auto bg-white border-t-small border-divider flex items-center justify-between p-5'>
          <span>
            <b>{selected.length} Project</b>
            <Button onClick={() => setSelected([])} variant='light' color='primary' size='sm' className='ml-5'>
              Clear
            </Button>
          </span>
          <ButtonEnable isToastError onClick={handleClick} color='primary' size='sm' radius='full'>
            Send
          </ButtonEnable>
        </div>
      )}
    </div>
  );
}

export default React.memo(Nfts);
