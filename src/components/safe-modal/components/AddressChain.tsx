// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { Multisig } from '@mimir-wallet/safe/types';

import React, { useCallback, useContext, useLayoutEffect, useMemo } from 'react';

import { InputAddress } from '@mimir-wallet/components';
import { AddressContext } from '@mimir-wallet/providers';

interface Props {
  multisig: Multisig;
  deep: number;
  filterPaths: Array<Address[]>;
  addressChain: Address[];
  setAddressChain: React.Dispatch<React.SetStateAction<Address[]>>;
}

function AddressChain({ multisig, filterPaths, deep, addressChain, setAddressChain }: Props) {
  const { signers, multisigs } = useContext(AddressContext);
  const selected: Address | undefined = addressChain[deep];

  const subMultisig = useMemo(() => multisigs.find((item) => item.address === selected), [multisigs, selected]);

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
      const signAddresses = signers.concat(multisigs.map((item) => item.address));

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
