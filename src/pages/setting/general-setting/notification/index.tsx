// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import NotificationEmail from './NotificationEmail';
import NotificationFirebase from './NotificationFirebase';

function NotificationBase() {
  return (
    <div className='space-y-5'>
      <div>
        <h6 className='font-bold mb-1 text-medium text-foreground/50'>Notification</h6>
        <NotificationFirebase />
      </div>
      <div>
        <h6 className='font-bold mb-1 text-medium text-foreground/50'>Email</h6>
        <NotificationEmail />
      </div>
    </div>
  );
}

export default React.memo(NotificationBase);
