// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Address } from 'abitype';
import type { SignatureResponse } from '@mimir-wallet/hooks/types';
import type { Multisig } from '@mimir-wallet/safe/types';

import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { isAddressEqual } from 'viem';

import { AddressContext } from '@mimir-wallet/providers';

import InputAddress from '../InputAddress';

interface Props {
  multisig: Multisig;
  deep: number;
  addressChain: Address[];
  setAddressChain: React.Dispatch<React.SetStateAction<Address[]>>;
  signatures?: SignatureResponse[];
}

function getFiltered(
  multisig: Multisig,
  multisigs: Multisig[],
  isMultisig: (address: Address) => boolean,
  signatures?: SignatureResponse[]
): Address[] {
  return multisig.members.filter((item) => {
    const sig = signatures?.find((sig) => isAddressEqual(sig.signature.signer, item));

    if (isMultisig(item)) {
      if (sig) {
        const subMultisig = multisigs.find((multisig) => isAddressEqual(multisig.address, item));

        if (subMultisig) {
          return getFiltered(subMultisig, multisigs, isMultisig, sig.children).length > 0;
        }

        return true;
      }

      return true;
    }

    return !sig;
  });
}

function AddressChain({ multisig, deep, addressChain, setAddressChain, signatures }: Props) {
  const { signers, isMultisig, multisigs } = useContext(AddressContext);
  const selected: Address | undefined = addressChain[deep];

  const subMultisig = useMemo(() => multisigs.find((item) => item.address === selected), [multisigs, selected]);

  const filtered = useMemo(
    () => getFiltered(multisig, multisigs, isMultisig, signatures),
    [multisig, isMultisig, multisigs, signatures]
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
            setAddressChain={setAddressChain}
          />
        </div>
      )}
    </div>
  );
}

export default React.memo(AddressChain);
