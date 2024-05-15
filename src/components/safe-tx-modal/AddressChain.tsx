// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SignatureResponse } from '@mimir-wallet/hooks/types';
import type { Multisig } from '@mimir-wallet/safe/types';

import React, { useCallback, useContext, useEffect, useMemo } from 'react';

import { AddressContext } from '@mimir-wallet/providers';

import InputAddress from '../InputAddress';

interface Props {
  multisig: Multisig;
  deep: number;
  filterPaths: Array<Address[]>;
  addressChain: Address[];
  setAddressChain: React.Dispatch<React.SetStateAction<Address[]>>;
  signatures?: SignatureResponse[];
}

function AddressChain({ multisig, filterPaths, deep, addressChain, setAddressChain, signatures }: Props) {
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

  useEffect(() => {
    if (!selected) {
      const signAddresses = signers.concat(multisigs.map((item) => item.address));

      const defaultSelect = filtered.find((member) => signAddresses.includes(member));

      if (defaultSelect) {
        setAddressChain((value) => {
          value[deep] = defaultSelect;

          return value.slice(0, deep + 1);
        });
      }
    }
  }, [deep, filtered, multisig, multisigs, selected, setAddressChain, signers]);

  const onChange = useCallback(
    (address: Address) => {
      setAddressChain((value) => {
        value[deep] = address;

        return value.slice(0, deep + 1);
      });
    },
    [deep, setAddressChain]
  );

  return (
    <div>
      <InputAddress
        onChange={onChange}
        value={selected || ''}
        defaultValue={selected}
        placeholder='Select address'
        label={deep === 0 ? 'Signer' : undefined}
        filtered={filtered}
      />
      {subMultisig && selected && (
        <div className='pl-2 pt-2'>
          <AddressChain
            signatures={signatures?.find((item) => item.signature.signer === selected)?.children}
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
