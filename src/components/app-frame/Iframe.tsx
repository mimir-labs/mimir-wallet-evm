// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MutableRefObject, ReactElement } from 'react';

type IFrameProps = {
  appUrl: string;
  allowedFeaturesList: string;
  title?: string;
  iframeRef?: MutableRefObject<HTMLIFrameElement | null>;
  onLoad?: () => void;
};

// see sandbox mdn docs for more details https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox
const IFRAME_SANDBOX_ALLOWED_FEATURES =
  'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-downloads allow-orientation-lock';

function Iframe({ appUrl, allowedFeaturesList, iframeRef, onLoad, title }: IFrameProps): ReactElement {
  return (
    <iframe
      style={{
        display: 'block',
        height: '100%',
        width: '100%',
        overflow: 'auto',
        boxSizing: 'border-box',
        border: 'none'
      }}
      id={`iframe-${appUrl}`}
      ref={iframeRef}
      src={appUrl}
      title={title}
      onLoad={onLoad}
      sandbox={IFRAME_SANDBOX_ALLOWED_FEATURES}
      allow={allowedFeaturesList}
    />
  );
}

export default Iframe;
