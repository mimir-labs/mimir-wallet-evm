// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createElement, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { apps } from '@mimir-wallet/config';

function AppExplorer() {
  const { url } = useParams<'url'>();
  const [element, setElement] = useState<JSX.Element>();

  useEffect(() => {
    if (url) {
      const _url = decodeURIComponent(url);

      if (_url.startsWith('mimir://app')) {
        const app = apps.find((item) => _url.startsWith(item.url));
        const params = new URLSearchParams(new URL(_url).searchParams);

        const props: Record<string, unknown> = {};

        for (const [key, value] of params) {
          props[key] = value;
        }

        app?.Component?.().then((C) => {
          setElement(createElement(C, props));
        });
      }
    }
  }, [url]);

  if (element) {
    return element;
  }

  return null;
}

export default AppExplorer;