import type {
  TokenBalance,
  JsWalletCreationResult,
  CreateWalletRequest as WasmCreateWalletRequest,
  SendTokensRequest as WasmSendTokensRequest,
  UnlockWalletRequest as WasmUnlockWalletRequest,
  // WalletInfo as WasmWalletInfo,
  JsWalletInfo,
  // WalletInfo,
} from "encryptions-service";

// import bs58 from 'bs58';

export type { JsWalletCreationResult as WalletCreationResult };

export type { TokenBalance };

export interface UIWalletInfo {
  wasmInfo: JsWalletInfo;
  isActive: boolean;
  cachedBalance?: string;
}

export const WalletInfoHelpers = {
  fromWasm(wasmInfo: JsWalletInfo, isActive: boolean = false): UIWalletInfo {
    return {
      wasmInfo,
      isActive,
      cachedBalance: undefined,
    };
  },


  getPublicKey(walletInfo: UIWalletInfo): string {
    return walletInfo.wasmInfo.pubkey
  },

  getDisplayName(walletInfo: UIWalletInfo): string {
    return walletInfo.wasmInfo.display_name ?? "Unnamed Wallet";
  },

  isUnlocked(walletInfo: UIWalletInfo): boolean {
    return walletInfo.wasmInfo.is_unlocked;
  },

  withBalance(walletInfo: UIWalletInfo, balance: string): UIWalletInfo {
    return {
      ...walletInfo,
      cachedBalance: balance,
    };
  },
};

export interface CreateWalletParams {
  password: string;
  name?: string;
}

export interface SendTokensParams {
  fromPubkey: string;
  toPubkey: string;
  amount: string;
  mint?: string;
}

export interface UnlockWalletParams {
  pubkey: string;
  password: string;
}

export interface ChangePasswordParams {
  publicKey: string;
  oldPassword: string;
  newPassword: string;
}

export const RequestAdapters = {
  toCreateWalletRequest(params: CreateWalletParams): WasmCreateWalletRequest {
    const request: WasmCreateWalletRequest = {
      password: params.password,
    };

    if (
      params.name !== undefined &&
      params.name !== null &&
      params.name !== ""
    ) {
      request.display_name = params.name;
    }

    return request;
  },
  toSendTokensRequest(params: SendTokensParams): WasmSendTokensRequest {
    const SOL_MINT = "So11111111111111111111111111111111111111112";
    return {
      from: params.fromPubkey,
      to: params.toPubkey,
      amount: params.amount,
      mint: params.mint ?? SOL_MINT,
    };
  },

  toUnlockWalletRequest(params: UnlockWalletParams): WasmUnlockWalletRequest {
    return {
      pubkey: params.pubkey,
      password: params.password,
    };
  },
};

export class WalletServiceError extends Error {
  public code: string;
  public originalError?: unknown;

  constructor(message: string, code: string, originalError?: unknown) {
    super(message);
    this.name = "WalletServiceError";
    this.code = code;
    this.originalError = originalError;
  }
}

export const WalletErrorCodes = {
  NOT_INITIALIZED: "NOT_INITIALIZED",
  WALLET_NOT_FOUND: "WALLET_NOT_FOUND",
  INVALID_PASSWORD: "INVALID_PASSWORD",
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
  NETWORK_ERROR: "NETWORK_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export interface IWalletService {
  initialize(): void;
  isReady(): boolean;
  createWallet(params: CreateWalletParams): JsWalletCreationResult;
  listWallets(): UIWalletInfo[];
  unlockWallet(params: UnlockWalletParams): boolean;
  getBalance(
    publicKey: string,
    mint?: string
  ): TokenBalance | undefined;
  sendTokens(params: SendTokensParams): Promise<string>;
  changePassword(params: ChangePasswordParams): boolean;
  getActiveWallet(): UIWalletInfo | null;
  setActiveWallet(publicKey: string): boolean;
  refreshActiveWalletBalance(): Promise<TokenBalance[]>;
  cleanupInactiveWallets(): void;
}
