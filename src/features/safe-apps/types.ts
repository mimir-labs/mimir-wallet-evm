// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PermissionRequest } from '@safe-global/safe-apps-sdk/dist/types/types/permissions';

export type SafePermissionsRequest = {
  origin: string;
  requestId: string;
  request: PermissionRequest[];
};
