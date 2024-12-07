// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AppConfig } from '@mimir-wallet/config';

import { Card, CardBody, Chip } from '@nextui-org/react';
import React, { createElement, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';

import IconStar from '@mimir-wallet/assets/svg/icon-star.svg?react';
import { useCurrentChain } from '@mimir-wallet/hooks';

import AppDetails from './AppDetails';
import Button from './Button';
import Drawer from './Drawer';

interface Props {
  addFavorite: (id: string | number) => void;
  removeFavorite: (id: string | number) => void;
  isFavorite: (id: string | number) => boolean;
  app: AppConfig;
}

function AppCell({ addFavorite, app, isFavorite, removeFavorite }: Props) {
  const [chainId] = useCurrentChain();
  const [detailsOpen, toggleOpen] = useToggle(false);
  const [isDrawerOpen, toggleDrawerOpen] = useToggle(false);
  const [element, setElement] = useState<JSX.Element>();
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

  const openApp = useCallback(() => {
    toggleOpen(false);

    if (!app.isDrawer) {
      if (app.isExternal) {
        window.open(app.url, '_blank');
      } else {
        navigate(`/apps/${encodeURIComponent(app.url)}`);
      }
    } else {
      app.Component?.().then((C) => {
        toggleDrawerOpen(true);
        setElement(
          createElement(C, {
            onClose: () => toggleDrawerOpen(false)
          } as Record<string, unknown>)
        );
      });
    }
  }, [app, navigate, toggleDrawerOpen, toggleOpen]);

  return (
    <>
      <Card className='cursor-pointer'>
        <CardBody onClick={openApp} className='flex flex-col gap-5 p-5'>
          <div>
            <div className='flex items-center justify-between mb-2.5'>
              <h4 className='font-bold text-xl'>{app.name}</h4>
              {app.isScrollSession && chainId === 534_352 && (
                <Chip
                  startContent={
                    <svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14' fill='none'>
                      <path
                        d='M13.067 9.34888V1.59697C13.0567 0.948338 12.5522 0.42627 11.9191 0.42627H4.02242C2.31852 0.452637 0.949219 1.88174 0.949219 3.63251C0.949219 4.22314 1.10365 4.72938 1.34045 5.17235C1.54121 5.54149 1.85522 5.88954 2.16409 6.14795C2.2516 6.22175 2.21042 6.19013 2.4781 6.35889C2.84874 6.59088 3.27085 6.70691 3.27085 6.70691L3.26571 11.3422C3.276 11.5637 3.29659 11.7747 3.35322 11.9698C3.52824 12.6237 3.97094 13.1247 4.57324 13.3672C4.82547 13.4674 5.1086 13.536 5.41232 13.5413L11.7183 13.5624C12.9743 13.5624 13.9936 12.5182 13.9936 11.2262C13.9987 10.4616 13.6281 9.77606 13.067 9.34888Z'
                        fill='#FFEEDA'
                      />
                      <path
                        d='M13.2216 11.2851C13.1958 12.113 12.5318 12.7774 11.7184 12.7774L7.37891 12.7616C7.72377 12.3503 7.93482 11.8176 7.93482 11.2376C7.93482 10.3253 7.40463 9.69775 7.40463 9.69775H11.7236C12.5524 9.69775 13.2267 10.3885 13.2267 11.2376L13.2216 11.2851Z'
                        fill='#EBC28E'
                      />
                      <path
                        d='M2.57591 5.49462C2.07657 5.00946 1.72653 4.38192 1.72653 3.63837V3.55927C1.76771 2.28837 2.78696 1.26533 4.02757 1.22841H11.9242C12.1301 1.23896 12.2949 1.38662 12.2949 1.60283V8.44772C12.475 8.47939 12.5625 8.50576 12.7376 8.56905C12.8766 8.62179 13.067 8.7325 13.067 8.7325V1.60283C13.0567 0.954195 12.5522 0.432129 11.9191 0.432129H4.02242C2.31852 0.458496 0.949219 1.88759 0.949219 3.63837C0.949219 4.65614 1.40222 5.52626 2.14349 6.13795C2.19497 6.18018 2.2413 6.23292 2.37515 6.23292C2.6068 6.23292 2.77152 6.04304 2.76123 5.83739C2.75608 5.66336 2.68401 5.60008 2.57591 5.49462Z'
                        fill='#151F34'
                      />
                      <path
                        d='M11.7181 8.89618H5.52536C5.1084 8.90143 4.77379 9.24425 4.77379 9.67137V10.5836C4.78409 11.0056 5.13414 11.3641 5.5511 11.3641H6.00925V10.5836H5.5511V9.69249C5.5511 9.69249 5.66435 9.69249 5.80334 9.69249C6.5858 9.69249 7.16237 10.436 7.16237 11.2323C7.16237 11.939 6.53432 12.8407 5.48418 12.7669C4.55244 12.7036 4.04796 11.8546 4.04796 11.2323V3.50146C4.04796 3.15342 3.76998 2.86865 3.43023 2.86865H2.8125V3.65967H3.27065V11.2376C3.24491 12.7774 4.34138 13.5526 5.48418 13.5526L11.7233 13.5737C12.9793 13.5737 13.9986 12.5296 13.9986 11.2376C13.9986 9.94559 12.9742 8.89618 11.7181 8.89618ZM13.2212 11.285C13.1955 12.113 12.5314 12.7774 11.7181 12.7774L7.37855 12.7616C7.72348 12.3503 7.93453 11.8176 7.93453 11.2376C7.93453 10.3253 7.40428 9.69774 7.40428 9.69774H11.7233C12.552 9.69774 13.2264 10.3886 13.2264 11.2376L13.2212 11.285Z'
                        fill='#151F34'
                      />
                      <path
                        d='M10.0479 3.80127H5.37891V3.01025H10.0479C10.259 3.01025 10.434 3.18427 10.434 3.40576C10.434 3.62197 10.2641 3.80127 10.0479 3.80127Z'
                        fill='#151F34'
                      />
                      <path
                        d='M10.0479 7.52397H5.37891V6.73291H10.0479C10.259 6.73291 10.434 6.90698 10.434 7.12847C10.434 7.34465 10.2641 7.52397 10.0479 7.52397Z'
                        fill='#151F34'
                      />
                      <path
                        d='M10.8716 5.66259H5.37891V4.87158H10.8664C11.0775 4.87158 11.2525 5.0456 11.2525 5.26709C11.2576 5.48329 11.0826 5.66259 10.8716 5.66259Z'
                        fill='#151F34'
                      />
                    </svg>
                  }
                  className='bg-[#FFEED8] pl-2'
                >
                  Scroll Sessions
                </Chip>
              )}
            </div>
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

      {app.isDrawer && (
        <Drawer placement='right' isOpen={isDrawerOpen} onClose={() => toggleDrawerOpen(false)}>
          <div className='h-full sm:p-5 p-4'>{element}</div>
        </Drawer>
      )}

      <AppDetails app={app} onClose={toggleOpen} open={detailsOpen} onOpenApp={openApp} />
    </>
  );
}

export default React.memo(AppCell);
