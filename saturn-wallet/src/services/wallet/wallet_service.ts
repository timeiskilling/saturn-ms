import type {
  TokenBalance,
  JsWalletCreationResult,
  CreateWalletRequest as WasmCreateWalletRequest,
  SendTokensRequest as WasmSendTokensRequest,
  UnlockWalletRequest as WasmUnlockWalletRequest,
  WalletInfo as WasmWalletInfo,
} from "encryptions-service";

// ============================================================================
// DIRECT WASM RE-EXPORTS
// Ці типи використовуються напряму з WASM без жодних змін
// ============================================================================

/**
 * Результат створення гаманця. Експортується напряму з WASM.
 * Містить публічний ключ та фразу відновлення.
 */
export type { JsWalletCreationResult as WalletCreationResult };

/**
 * Баланс токену. Експортується напряму з WASM.
 * Містить всю інформацію про токен включно з decimals, symbol, USD ціною.
 */
export type { TokenBalance };

// ============================================================================
// UI-ENHANCED TYPES
// Ці типи розширюють WASM типи додатковими полями для UI
// ============================================================================

/**
 * Інформація про гаманець для відображення в UI.
 * Розширює базовий WASM тип додатковою UI логікою.
 */
export interface UIWalletInfo {
  /** Базова інформація з WASM */
  wasmInfo: WasmWalletInfo;
  /** UI-специфічне поле: чи є цей гаманець активним зараз */
  isActive: boolean;
  /** Кешований баланс для швидкого відображення (може бути застарілим) */
  cachedBalance?: string;
}

/**
 * Хелпер функції для роботи з UIWalletInfo
 */
export const WalletInfoHelpers = {
  /**
   * Конвертує WASM WalletInfo в UI-friendly формат
   */
  fromWasm(wasmInfo: WasmWalletInfo, isActive: boolean = false): UIWalletInfo {
    return {
      wasmInfo,
      isActive,
      cachedBalance: undefined,
    };
  },

  /**
   * Отримує публічний ключ як рядок
   */
  getPublicKey(walletInfo: UIWalletInfo): string {
    return walletInfo.wasmInfo.pubkey.toString();
  },

  /**
   * Отримує відображуване ім'я гаманця
   */
  getDisplayName(walletInfo: UIWalletInfo): string {
    return walletInfo.wasmInfo.display_name ?? "Unnamed Wallet";
  },

  /**
   * Перевіряє чи гаманець розблокований
   */
  isUnlocked(walletInfo: UIWalletInfo): boolean {
    return walletInfo.wasmInfo.is_unlocked;
  },

  /**
   * Оновлює кешований баланс
   */
  withBalance(walletInfo: UIWalletInfo, balance: string): UIWalletInfo {
    return {
      ...walletInfo,
      cachedBalance: balance,
    };
  },
};

// ============================================================================
// REQUEST ADAPTERS
// Адаптери для конвертації UI запитів в WASM формат
// ============================================================================

/**
 * Параметри для створення гаманця з UI
 * Спрощений інтерфейс - тільки те, що потрібно користувачу
 */
export interface CreateWalletParams {
  password: string;
  name?: string;
}

/**
 * Параметри для відправки токенів з UI
 */
export interface SendTokensParams {
  fromPubkey: string;
  toPubkey: string;
  amount: string;
  mint?: string; // Опційний, за замовчуванням SOL
}

/**
 * Параметри для розблокування гаманця з UI
 */
export interface UnlockWalletParams {
  pubkey: string;
  password: string;
}

/**
 * Параметри для зміни паролю
 */
export interface ChangePasswordParams {
  publicKey: string;
  oldPassword: string;
  newPassword: string;
}

/**
 * Адаптери для конвертації UI параметрів в WASM запити
 */
export const RequestAdapters = {
  /**
   * Конвертує UI параметри створення гаманця в WASM запит
   * ВАЖЛИВО: Не додаємо поля з null, а просто не включаємо їх в об'єкт
   */
  toCreateWalletRequest(params: CreateWalletParams): WasmCreateWalletRequest {
    const request: WasmCreateWalletRequest = {
      password: params.password,
    };
    
    // Додаємо поле тільки якщо воно має значення
    if (params.name !== undefined && params.name !== null && params.name !== '') {
      request.display_name = params.name;
    }
    
    return request;
  },

  /**
   * Конвертує UI параметри відправки токенів в WASM запит
   */
  toSendTokensRequest(params: SendTokensParams): WasmSendTokensRequest {
    const SOL_MINT = "So11111111111111111111111111111111111111112";
    return {
      from: params.fromPubkey,
      to: params.toPubkey,
      amount: params.amount,
      mint: params.mint ?? SOL_MINT,
    };
  },

  /**
   * Конвертує UI параметри розблокування в WASM запит
   */
  toUnlockWalletRequest(params: UnlockWalletParams): WasmUnlockWalletRequest {
    return {
      pubkey: params.pubkey,
      password: params.password,
    };
  },
};
// ============================================================================
// ERROR HANDLING
// Система обробки помилок
// ============================================================================

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

// ============================================================================
// SERVICE INTERFACE
// Інтерфейс сервісу використовує гібридні типи
// ============================================================================

export interface IWalletService {
  initialize(): Promise<void>;
  isReady(): boolean;

  /**
   * Створює новий гаманець
   * @returns JsWalletCreationResult напряму з WASM - містить pubkey та recovery_phrase
   */
  createWallet(params: CreateWalletParams): Promise<JsWalletCreationResult>;

  /**
   * Отримує список всіх гаманців
   * @returns Масив UI-friendly інформації про гаманці
   */
  listWallets(): Promise<UIWalletInfo[]>;

  /**
   * Розблоковує гаманець
   */
  unlockWallet(params: UnlockWalletParams): Promise<void>;

  /**
   * Отримує баланс токену
   * @returns TokenBalance напряму з WASM або undefined якщо не знайдено
   */
  getBalance(publicKey: string, mint?: string): Promise<TokenBalance | undefined>;

  /**
   * Відправляє токени
   * @returns Сигнатура транзакції
   */
  sendTokens(params: SendTokensParams): Promise<string>;

  /**
   * Змінює пароль гаманця
   */
  changePassword(params: ChangePasswordParams): Promise<void>;

  /**
   * Отримує активний гаманець
   * @returns UI-friendly інформація про активний гаманець або null
   */
  getActiveWallet(): Promise<UIWalletInfo | null>;

  /**
   * Встановлює активний гаманець
   */
  setActiveWallet(publicKey: string): Promise<void>;

  /**
   * Оновлює баланс активного гаманця
   * @returns Масив TokenBalance напряму з WASM
   */
  refreshActiveWalletBalance(): Promise<TokenBalance[]>;

  /**
   * Очищує неактивні гаманці
   */
  cleanupInactiveWallets(): Promise<void>;
}