// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Multisig } from '@mimir-wallet/safe/types';

import React, { useCallback, useContext, useLayoutEffect, useMemo } from 'react';

import { InputAddress } from '@mimir-wallet/components';
import { useCurrentChain } from '@mimir-wallet/hooks';
import { AddressContext } from '@mimir-wallet/providers';

interface Props {
  multisig: Multisig;
  deep: number;
  filterPaths: Array<Address[]>;
  addressChain: Address[];
  setAddressChain: React.Dispatch<React.SetStateAction<Address[]>>;
}

function AddressChain({ multisig, filterPaths, deep, addressChain, setAddressChain }: Props) {
  const [chainId] = useCurrentChain();
  const { signers, multisigs } = useContext(AddressContext);
  const selected: Address | undefined = addressChain.at(deep);

  const filtered = useMemo(
    () =>
      multisig.members.filter((member) => {
        return filterPaths
          .map((item) => item[deep])
          .filter((item) => !!item)
          .includes(member);
      }),
    [deep, filterPaths, multisig.members]
  );

  useLayoutEffect(() => {
    if (!selected) {
      const signAddresses = signers.concat(Object.keys(multisigs) as Address[]);

      const defaultSelect = filtered.find((member) => signAddresses.includes(member));

      if (defaultSelect) {
        setAddressChain((value) => {
          const newValue = [...value];

          newValue[deep] = defaultSelect;

          return newValue.slice(0, deep + 1);
        });
      }
    }
  }, [deep, filtered, multisigs, selected, setAddressChain, signers]);

  const onChange = useCallback(
    (address: Address) => {
      setAddressChain((value) => {
        const newValue = [...value];

        newValue[deep] = address;

        return newValue.slice(0, deep + 1);
      });
    },
    [deep, setAddressChain]
  );

  const subMultisig = useMemo(
    () =>
      selected && multisigs[selected] && multisigs[selected].find((item) => !item.readonly && item.chainId === chainId),
    [chainId, multisigs, selected]
  );

  return (
    <div>
      <InputAddress
        isSign
        onChange={onChange}
        value={selected || ''}
        defaultValue={selected}
        placeholder='Select address'
        label={deep === 0 ? 'Signer' : undefined}
        filtered={filtered}
      />
      {subMultisig && (
        <div className='pl-2 pt-2'>
          <AddressChain
            multisig={subMultisig}
            addressChain={addressChain}
            deep={deep + 1}
            filterPaths={filterPaths}
            setAddressChain={setAddressChain}
          />
        </div>
      )}
    </div>
  );
}

export default React.memo(AddressChain);
