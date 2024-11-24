// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from '@nextui-org/react';
import { numberToHex, RpcError, UserRejectedRequestError } from 'viem';
import { ProviderNotFoundError, useChains, useConnections } from 'wagmi';

import ArrowDown from '@mimir-wallet/assets/svg/ArrowDown.svg?react';
import { Button } from '@mimir-wallet/components';
import { CustomChain, supportedChains } from '@mimir-wallet/config';
import { useMediaQuery } from '@mimir-wallet/hooks';

const mains = supportedChains.filter((item) => !item.testnet);
const tests = supportedChains.filter((item) => !!item.testnet);

async function _switchChain(provider: any, chain: CustomChain) {
  if (!provider) throw new ProviderNotFoundError();

  try {
    provider?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: numberToHex(chain.id) }]
    });
  } catch (err) {
    const error = err as RpcError;

    if (/(user rejected)/i.test(error.message)) throw new UserRejectedRequestError(error);

    // Indicates chain is not added to provider
    try {
      const blockExplorerUrls: string[] = [chain.blockExplorers.default.url];
      const rpcUrls: readonly string[] = [...chain.rpcUrls.default.http];

      const addEthereumChain = {
        blockExplorerUrls,
        chainId: numberToHex(chain.id),
        chainName: chain.name,
        iconUrls: [chain.iconUrl],
        nativeCurrency: chain.nativeCurrency,
        rpcUrls
      };

      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [addEthereumChain]
      });

      return chain;
    } catch (error) {
      throw new UserRejectedRequestError(error as Error);
    }
  }
}

function Networks() {
  const [chain] = useChains() as [chain: CustomChain];
  const connections = useConnections();
  const upSm = useMediaQuery('sm');

  const switchChain = async (chain: CustomChain) => {
    for (const connection of connections) {
      if ((await connection.connector.getChainId()) !== chain.id) {
        await _switchChain(await connection.connector.getProvider(), chain);
      }
    }
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant='shadow'
          className='border-white border-2 bg-white bg-gradient-to-r from-black/[0.03] to-black/[0.06]'
          startContent={<Avatar src={chain?.iconUrl} className='w-[24px] h-[24px] bg-transparent' />}
          endContent={<ArrowDown />}
        >
          {upSm ? chain.name : ''}
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownSection title='' showDivider>
          {mains.map((item) => (
            <DropdownItem
              startContent={<Avatar src={item?.iconUrl} className='w-[24px] h-[24px] bg-transparent' />}
              key={item.id}
              onClick={() => {
                switchChain(item)
                  .then(() => {})
                  .catch(() => {})
                  .finally(() => {
                    window.location.href = `${window.location.pathname}?chainid=${item.id}`;
                  });
              }}
            >
              {item.name}
            </DropdownItem>
          ))}
        </DropdownSection>
        <DropdownSection title='Testnets'>
          {tests.map((item) => (
            <DropdownItem
              startContent={<Avatar src={item?.iconUrl} className='w-[24px] h-[24px] bg-transparent' />}
              key={item.id}
              onClick={() => {
                switchChain(item)
                  .then(() => {})
                  .catch(() => {})
                  .finally(() => {
                    window.location.href = `${window.location.pathname}?chainid=${item.id}`;
                  });
              }}
            >
              {item.name}
            </DropdownItem>
          ))}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}

export default Networks;
