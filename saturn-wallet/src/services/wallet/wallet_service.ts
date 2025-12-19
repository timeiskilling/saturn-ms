export interface WalletInfo {
  publicKey: string;
  name: string;
  balance: string;
  isActive: boolean;
}

export interface CreateWalletRequest {
  password: string;
  name: string;
}

export interface CreateWalletResponse {
  publicKey: string;
  recoveryPhrase: string;
  name: string;
}

export interface UnlockWalletRequest {
  pubkey: string;
  password: string;
} 

export interface SendTokensRequest {
  fromPubkey: string;
  toPubkey: string;
  amount: string;
  mint?: string;
}

export interface ChangePasswordRequest {
  publicKey: string;
  oldPassword: string;
  newPassword: string;
}

export interface WalletBalance {
  publicKey: string;
  balance: string;
  mint: string;
}

export interface IWalletService {
  initialize(): Promise<void>;
  isReady(): boolean;
  createWallet(request: CreateWalletRequest): Promise<CreateWalletResponse>;
  listWallets(): Promise<WalletInfo[]>;
  unlockWallet(request: UnlockWalletRequest): Promise<void>;
  getBalance(publicKey: string, mint?: string): Promise<WalletBalance>;
  sendTokens(request: SendTokensRequest): Promise<string>;
  changePassword(request: ChangePasswordRequest): Promise<void>;
  getActiveWallet(): Promise<WalletInfo | null>;
  setActiveWallet(publicKey: string): Promise<void>;
  refreshActiveWalletBalance(): Promise<WalletBalance>;
  cleanupInactiveWallets(): Promise<void>;
}

export class WalletServiceError extends Error {
public code: string;
public originalError?: unknown;
  
constructor(
    message: string,
    code : string,
    originalError?: unknown
) {
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
