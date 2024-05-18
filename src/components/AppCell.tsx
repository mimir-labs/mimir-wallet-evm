// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AppConfig } from '@mimir-wallet/config';

import { Card, CardBody } from '@nextui-org/react';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import IconStar from '@mimir-wallet/assets/svg/icon-star.svg?react';

import AppDetails from './AppDetails';
import Button from './Button';

interface Props {
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  app: AppConfig;
}

function AppCell({ addFavorite, app, isFavorite, removeFavorite }: Props) {
  const [detailsOpen, toggleOpen] = useToggle(false);
  const _isFavorite = useMemo(() => isFavorite(app.id), [app.id, isFavorite]);
  const navigate = useNavigate();
  const toggleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (_isFavorite) {
        removeFavorite(app.id);
      } else {
        addFavorite(app.id);
      }
    },
    [_isFavorite, addFavorite, app.id, removeFavorite]
  );

  return (
    <>
      <AppDetails app={app} onClose={toggleOpen} open={detailsOpen} />
      <Card className='cursor-pointer'>
        <CardBody onClick={() => navigate(`/apps/${encodeURIComponent(app.url)}`)} className='flex flex-col gap-5 p-5'>
          <div>
            <h4 className='font-bold text-xl mb-1'>{app.name}</h4>
            <p className='text-tiny text-ellipsis overflow-hidden h-[36px] leading-[18px] text-foreground/50 line-clamp-2'>
              {app.desc}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex-1'>
              <img alt={app.name} src={app.icon} style={{ width: 32, height: 32 }} />
            </div>
            <Button onClick={toggleOpen} variant='bordered' color='primary' radius='full'>
              Details
            </Button>
            <Button radius='full' onClick={toggleFavorite} color='secondary' isIconOnly>
              <IconStar
                data-favorite={_isFavorite}
                className='text-primary opacity-20 data-[favorite=true]:opacity-100'
              />
            </Button>
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default React.memo(AppCell);
