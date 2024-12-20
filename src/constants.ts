// Copyright 2023-2024 dev.mimir authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const LS_NAMESPACE = 'MIMIR__';

export const CURRENT_ACCOUNT_KEY = `${LS_NAMESPACE}current_account`;
export const CURRENT_CHAINID_KEY = `${LS_NAMESPACE}chainid`;

export const FAVORITE_APP_KEY = 'favorite_app';
export const CUSTOM_APP_KEY = `${LS_NAMESPACE}custom_app`;
export const DEVICE_UUIR_KEY = `${LS_NAMESPACE}uuid`;

// @deprecated
export const DEPRECATED_ADDRESS_BOOK_KEY = 'address_book';
export const ADDRESS_BOOK_KEY = 'address_book_chain';
export const ADDRESS_NAMES_KEY = 'address_names';
export const WATCH_ONLY_KEY = `${LS_NAMESPACE}watch_only`;
export const CUSTOM_TOKENS_KEY = 'custom_tokens';
export const BATCH_TX_KEY = 'batch_tx';
export const ENABLE_EIP_3770_KEY = 'enable_eip3770';
export const IGNORE_RECOVERY_ACCOUNT_KEY = 'ignore_recover_account';

export const CHAIN_RPC_URL_PREFIX = 'chain_rpc_url:';
export const PENDING_SAFE_TX_PREFIX = 'pending_safe_tx:';

export const ADDRESS_BOOK_UPGRADE_VERSION_KEY = 'address_book_upgrade_version';

// times second
export const ONE_DAY = 86400;
export const ONE_HOUR = 3600;
export const ONE_MINUTE = 60;

export const EmptyArray = [];

export const FALLBACK_HANDLER_STORAGE_SLOT =
  '0x6c9a6c4a39284e37ed1cf53d337577d14212a4870fb976a4366c693b939918d5' as const;

export const WALLET_CONNECT_PROJECT_ID = 'db2a617b03addd5e1e485d0a677c1ef4';
