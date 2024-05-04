// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Nft } from '@mimir-wallet/hooks/types';

import { Avatar, Card, CardBody, CardFooter } from '@nextui-org/react';
import React from 'react';
import { useAccount } from 'wagmi';

import EtherscanIcon from '@mimir-wallet/assets/images/etherscan.svg';
import { explorerUrl } from '@mimir-wallet/utils';

interface Props extends Nft {}

function NftCard({ imageUrl, tokenId, contractAddress }: Props) {
  const { chain } = useAccount();

  return (
    <Card>
      <CardBody>
        <Avatar className='w-full h-auto aspect-[1/1]' radius='sm' src={imageUrl} />
      </CardBody>
      <CardFooter className='text-large justify-between pt-0'>
        <b className='max-w-[50%] text-ellipsis overflow-hidden whitespace-nowrap'>{`# ${tokenId}`}</b>
        <div className='flex gap-x-1'>
          {chain && (
            <a href={explorerUrl('nft', chain, [contractAddress, tokenId])} target='_blank' rel='noreferrer'>
              <Avatar style={{ width: 20, height: 20 }} src={EtherscanIcon} alt='etherscan' />
            </a>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default React.memo(NftCard);
