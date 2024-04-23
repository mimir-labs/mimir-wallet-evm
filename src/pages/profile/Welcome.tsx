// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Link } from '@nextui-org/react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useContext, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';

import CreateImg from '@mimir-wallet/assets/images/create.webp';
import ImportImg from '@mimir-wallet/assets/images/import.webp';
import StartImg from '@mimir-wallet/assets/images/start.webp';
import { Button } from '@mimir-wallet/components';
import { AddressContext } from '@mimir-wallet/providers';

function Cell({
  img,
  href,
  desc,
  imgW,
  colored,
  title,
  onClick
}: {
  img: string;
  imgW: number;
  title: string;
  desc?: string;
  colored: boolean;
  href?: string;
  onClick?: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      as={href ? Link : undefined}
      href={href}
      className='flex flex-col items-center justify-center gap-8 w-[240px] h-[240px] bg-white data-[colored=true]:bg-colored-background border-secondary border-1 rounded-[40px] shadow-medium'
      data-colored={colored ? true : undefined}
    >
      <img src={img} alt={`mimir ${title}`} style={{ width: imgW }} />
      <div className='text-foreground text-opacity-50 group-data-[colored=true]:text-white group-data-[colored=true]:text-opacity-100'>
        <h4 className='font-bold text-[20px]'>{title}</h4>
        {desc ? <p className='text-small'>{desc}</p> : null}
      </div>
    </Button>
  );
}

function Welcome() {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchAddress } = useContext(AddressContext);
  const extensionStart = useRef(false);

  useEffect(() => {
    if (isConnected && address && extensionStart.current) {
      switchAddress(address);
    }
  }, [address, isConnected, switchAddress]);

  return (
    <div>
      <h1 className='font-bold text-[40px]'>Welcome</h1>
      <div className='flex gap-5 mt-5'>
        <Cell href='/create-multisig' title='Create Multisig' img={CreateImg} colored imgW={130} />
        <Cell href='/create-multisig' title='Import Multisig' img={ImportImg} colored imgW={92} />
        <Cell
          onClick={
            isConnected && address
              ? () => switchAddress(address)
              : () => {
                  extensionStart.current = true;
                  openConnectModal?.();
                }
          }
          title='Not Now'
          img={StartImg}
          colored={false}
          imgW={98}
          desc='Start from extension wallet  >'
        />
      </div>
    </div>
  );
}

export default Welcome;
