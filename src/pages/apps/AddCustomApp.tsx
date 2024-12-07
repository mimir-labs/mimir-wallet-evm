// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AppConfig } from '@mimir-wallet/config';

import { Avatar, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from '@nextui-org/react';
import { join } from 'path';
import React, { useCallback, useRef, useState } from 'react';

import IconEdit from '@mimir-wallet/assets/svg/icon-edit.svg?react';
import { Alert, Button, Input } from '@mimir-wallet/components';
import { useCurrentChain, useDebounceFn, useVisibleApps } from '@mimir-wallet/hooks';
import { isValidURL } from '@mimir-wallet/utils';

function AddCustomApp({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [chainId] = useCurrentChain();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);
  const [edit, setEdit] = useState('');
  const [findApp, setFindApp] = useState<AppConfig>();
  const { addCustom } = useVisibleApps();

  const handleClose = useCallback(() => {
    onClose();
    setFindApp(undefined);
    setError(undefined);
    setIsLoading(false);
  }, [onClose]);

  const onInput = useDebounceFn(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;

      if (val && !isValidURL(val)) {
        setError(new Error('Invalid URL'));

        return;
      }

      if (!val) return;

      setIsLoading(true);

      let result: { name: string; description?: string; icon?: string };

      try {
        const _url = new URL(val);

        _url.pathname = join(_url.pathname, 'manifest.json');

        const json = await fetch(_url).then((res) => res.json());

        const title = json.name || '';
        const description = json.description || '';
        let iconUrl: string | undefined;

        if (json.iconPath) {
          iconUrl = json.iconPath;
        } else if (json.icons && Array.isArray(json.icons) && json.icons.length > 0) {
          const url = new URL(val);

          url.pathname = json.icons[0].src;

          iconUrl = url.toString();
        }

        if (iconUrl) {
          if (!isValidURL(iconUrl)) {
            const url = new URL(val);

            url.pathname = join(url.pathname, iconUrl);

            iconUrl = url.toString();
          }
        }

        result = { name: title || '', description: description || '', icon: iconUrl };
      } catch {
        try {
          const _url = new URL(val);

          const html = await fetch(_url, { redirect: 'follow' }).then((res) => res.text());
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          const title = doc.querySelector('title') ? doc.querySelector('title')?.innerText : '';
          const description = doc.querySelector('meta[name="description"]')
            ? doc.querySelector('meta[name="description"]')?.getAttribute('content')
            : '';
          const icon = doc.querySelector('link[rel~="icon"]')
            ? doc.querySelector('link[rel~="icon"]')?.getAttribute('href')
            : '';

          let iconUrl: string | undefined;

          if (icon) {
            if (isValidURL(icon)) {
              iconUrl = icon;
            } else {
              const url = new URL(val);

              url.pathname = join(url.pathname, icon);

              iconUrl = url.toString();
            }
          }

          result = { name: title || '', description: description || '', icon: iconUrl };
        } catch (e) {
          setError(new Error("The app doesn't support Safe App functionality"));
          setIsLoading(false);
          setFindApp(undefined);

          return;
        }
      }

      setFindApp({
        id: `custom-app-${val}`,
        url: val,
        name: result.name,
        desc: result.description || '',
        icon: result.icon,
        tags: [],
        supportedChains: [chainId]
      });

      setEdit(result.name);
      setError(undefined);
      setIsLoading(false);
    },
    [chainId]
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalHeader>Add New Customized App</ModalHeader>
        <Divider />
        <ModalBody>
          <Input
            label='Url'
            placeholder='eg. https://app.uniswap.org'
            variant='bordered'
            labelPlacement='outside'
            onChange={onInput}
            endContent={isLoading ? <Spinner size='sm' /> : null}
          />

          {error && <Alert severity='error' title={error?.message} />}

          {findApp && (
            <div className='p-5 flex items-center gap-5 shadow-medium border-1 border-secondary rounded-medium'>
              <Avatar src={findApp.icon} className='flex-shrink-0 w-[50px] h-[50px] bg-transparent' radius='none' />
              <div>
                <div className='flex items-center gap-2'>
                  <div
                    ref={editRef}
                    suppressContentEditableWarning
                    contentEditable
                    className='font-bold text-medium outline-none'
                    onInput={(e) => setFindApp({ ...findApp, name: e.currentTarget.textContent || '' })}
                  >
                    {edit}
                  </div>
                  <Button
                    size='tiny'
                    isIconOnly
                    variant='light'
                    className='text-foreground/50'
                    onClick={() => {
                      editRef.current?.focus();
                    }}
                  >
                    <IconEdit />
                  </Button>
                </div>
                <p className='mt-[5px] text-tiny text-foreground/50'>{findApp.desc}</p>
              </div>
            </div>
          )}
        </ModalBody>
        <Divider />
        <ModalFooter>
          <Button
            disabled={!findApp}
            fullWidth
            color='primary'
            radius='full'
            onClick={
              findApp
                ? () => {
                    addCustom(findApp);
                    handleClose();
                  }
                : undefined
            }
          >
            Add
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default React.memo(AddCustomApp);
