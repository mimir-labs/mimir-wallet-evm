// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Card, CardBody } from '@nextui-org/react';
import { useToggle } from 'react-use';

import IconAdd from '@mimir-wallet/assets/svg/icon-add-fill.svg?react';
import { AppCell, Button } from '@mimir-wallet/components';
import { useVisibleApps } from '@mimir-wallet/hooks';

import AddCustomApp from './AddCustomApp';

function CustomApps() {
  const [isOpen, toggleOpen] = useToggle(false);
  const { customApps, addFavorite, removeFavorite, isFavorite } = useVisibleApps();

  return (
    <>
      <div className='grid grid-cols-12 gap-5'>
        <div key='add-custom-app' className='col-span-4'>
          <Card className='cursor-pointer h-full'>
            <CardBody className='flex flex-row items-center gap-5 p-5' onClick={toggleOpen}>
              <Button variant='light' isIconOnly size='lg' radius='full'>
                <IconAdd className='text-primary w-12 h-12' />
              </Button>
              <div>
                <h6 className='font-bold text-medium'>Add New Customized App</h6>
                <p className='mt-1 text-tiny text-foreground text-opacity-50'>
                  You can add apps not listed but support Safe SDK.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {customApps.map((app) => (
          <div key={app.id} className='col-span-4'>
            <AppCell addFavorite={addFavorite} app={app} isFavorite={isFavorite} removeFavorite={removeFavorite} />
          </div>
        ))}
      </div>

      <AddCustomApp isOpen={isOpen} onClose={toggleOpen} />
    </>
  );
}

export default CustomApps;
