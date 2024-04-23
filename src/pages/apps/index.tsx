// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createElement, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { apps } from '@mimir-wallet/config';

function Apps() {
  const { url } = useParams<'url'>();
  const [element, setElement] = useState<JSX.Element>();

  useEffect(() => {
    if (url) {
      const _url = decodeURIComponent(url);

      if (_url.startsWith('mimir://app')) {
        const app = apps.find((item) => item.url === _url);

        app?.Component?.().then((C) => {
          setElement(createElement(C));
        });
      }
    }
  }, [url]);

  if (element) {
    return element;
  }

  return null;
}

export default Apps;
