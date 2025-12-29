import initWasm, {
  WasmWalletManager,
  create_wallet_manager,
  type JsWalletCreationResult,
  type WalletInfo as WasmWalletInfo,
  type UnlockWalletRequest as WasmUnlockRequest,
  type SendTokensRequest as WasmSendTokensRequest,
  type CreateWalletRequest as WasmCreateWalletRequest,
  type TokenBalance,
  type Pubkey,
} from "encryptions-service";

import {
  type IWalletService,
  WalletServiceError,
  WalletErrorCodes,
  type CreateWalletRequest,
  type CreateWalletResponse,
  type WalletInfo,
  type UnlockWalletRequest,
  type SendTokensRequest,
  type ChangePasswordRequest,
  type WalletBalance,
} from "../wallet_service";

export interface WasmWalletServiceConfig {
  rpcUrl: string;
  jupiterUrl: string;
}

/**
 * Type mappers to convert between WASM types and application domain types.
 * These functions provide a clear boundary between the low-level WASM interface
 * and our application's type system.
 */
class WasmTypeMapper {
  /**
   * Converts a WASM Pubkey object to a string representation.
   * The Pubkey type from WASM has a toString() method we can use.
   */
  static pubkeyToString(pubkey: Pubkey): string {
    return pubkey.toString();
  }

  /**
   * Maps a WASM wallet info object to our application's WalletInfo type.
   * Handles optional fields and provides sensible defaults.
   */
  static toWalletInfo(wasmWallet: WasmWalletInfo, isActive: boolean = false): WalletInfo {
    return {
      publicKey: this.pubkeyToString(wasmWallet.pubkey),
      name: wasmWallet.display_name ?? "Unnamed Wallet",
      balance: "0", // Balance is fetched separately to avoid unnecessary RPC calls
      isActive,
    };
  }

  /**
   * Maps a WASM wallet creation result to our application's response type.
   */
  static toCreateWalletResponse(
    wasmResult: JsWalletCreationResult,
    requestedName?: string
  ): CreateWalletResponse {
    return {
      publicKey: wasmResult.pubkey,
      recoveryPhrase: wasmResult.recovery_phrase,
      name: requestedName ?? "Unnamed Wallet",
    };
  }

  /**
   * Maps a WASM TokenBalance to our application's WalletBalance type.
   * Handles the case where balance might be undefined.
   */
  static toWalletBalance(
    publicKey: string,
    tokenBalance: TokenBalance | undefined,
    requestedMint: string
  ): WalletBalance {
    if (!tokenBalance) {
      return {
        publicKey,
        balance: "0",
        mint: requestedMint,
      };
    }

    return {
      publicKey,
      balance: tokenBalance.amount,
      mint: tokenBalance.mint,
    };
  }

  /**
   * Converts our application's create wallet request to the WASM format.
   */
  static toWasmCreateRequest(request: CreateWalletRequest): WasmCreateWalletRequest {
    return {
      password: request.password,
      display_name: request.name ?? null,
      bip39_passphrase: null,
      network: null,
      keystore_timeout_secs: null,
    };
  }

  /**
   * Converts our application's unlock request to the WASM format.
   */
  static toWasmUnlockRequest(request: UnlockWalletRequest): WasmUnlockRequest {
    return {
      pubkey: request.pubkey,
      password: request.password,
    };
  }

  /**
   * Converts our application's send tokens request to the WASM format.
   * Uses SOL mint address as default if not specified.
   */
  static toWasmSendRequest(request: SendTokensRequest): WasmSendTokensRequest {
    const SOL_MINT = "So11111111111111111111111111111111111111112";
    
    return {
      from: request.fromPubkey,
      to: request.toPubkey,
      amount: request.amount,
      mint: request.mint ?? SOL_MINT,
    };
  }
}

export class WasmWalletService implements IWalletService {
  private walletManager: WasmWalletManager | null = null;
  private initialized = false;
  private config: WasmWalletServiceConfig;

  constructor(config: WasmWalletServiceConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize the WebAssembly module
      await initWasm();
      console.log("WASM module initialized");

      // Create the wallet manager instance with RPC and Jupiter URLs
      this.walletManager = await create_wallet_manager(
        this.config.rpcUrl,
        this.config.jupiterUrl
      );
      console.log("WalletManager created");

      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize WASM wallet service:", error);
      throw new WalletServiceError(
        "Failed to initialize wallet service",
        WalletErrorCodes.NOT_INITIALIZED,
        error
      );
    }
  }

  isReady(): boolean {
    return this.initialized && this.walletManager !== null;
  }

  /**
   * Ensures the service is initialized before performing operations.
   * Throws an error if called before initialization completes.
   */
  private ensureInitialized(): WasmWalletManager {
    if (!this.isReady() || !this.walletManager) {
      throw new WalletServiceError(
        "Wallet service is not initialized. Call initialize() first.",
        WalletErrorCodes.NOT_INITIALIZED
      );
    }
    return this.walletManager;
  }

  async createWallet(request: CreateWalletRequest): Promise<CreateWalletResponse> {
    const manager = this.ensureInitialized();

    try {
      const wasmRequest = WasmTypeMapper.toWasmCreateRequest(request);
      const wasmResponse = await manager.createWallet(wasmRequest);
      
      return WasmTypeMapper.toCreateWalletResponse(wasmResponse, request.name);
    } catch (error) {
      console.error("Failed to create wallet:", error);
      throw new WalletServiceError(
        "Failed to create wallet",
        WalletErrorCodes.UNKNOWN_ERROR,
        error
      );
    }
  }

  async listWallets(): Promise<WalletInfo[]> {
    const manager = this.ensureInitialized();

    try {
      const wasmWallets = await manager.listWallets();
      
      // Map each WASM wallet to our application's WalletInfo type
      return wasmWallets.map(wallet => WasmTypeMapper.toWalletInfo(wallet));
    } catch (error) {
      console.error("Failed to list wallets:", error);
      throw new WalletServiceError(
        "Failed to list wallets",
        WalletErrorCodes.UNKNOWN_ERROR,
        error
      );
    }
  }

  async unlockWallet(request: UnlockWalletRequest): Promise<void> {
    const manager = this.ensureInitialized();

    try {
      const wasmRequest = WasmTypeMapper.toWasmUnlockRequest(request);
      const success = await manager.unlockWallet(wasmRequest);

      if (!success) {
        throw new Error("Unlock operation returned false");
      }
    } catch (error) {
      console.error("Failed to unlock wallet:", error);
      throw new WalletServiceError(
        "Failed to unlock wallet. Check your password.",
        WalletErrorCodes.INVALID_PASSWORD,
        error
      );
    }
  }

  async getBalance(
    publicKey: string,
    mint: string = "So11111111111111111111111111111111111111112"
  ): Promise<WalletBalance> {
    const manager = this.ensureInitialized();

    try {
      const tokenBalance = await manager.getBalance(publicKey, mint);
      
      return WasmTypeMapper.toWalletBalance(publicKey, tokenBalance, mint);
    } catch (error) {
      console.error("Failed to get balance:", error);
      throw new WalletServiceError(
        "Failed to get balance",
        WalletErrorCodes.NETWORK_ERROR,
        error
      );
    }
  }

  async sendTokens(request: SendTokensRequest): Promise<string> {
    const manager = this.ensureInitialized();

    try {
      const wasmRequest = WasmTypeMapper.toWasmSendRequest(request);
      const signature = await manager.sendTokens(wasmRequest);
      
      return signature;
    } catch (error) {
      console.error("Failed to send tokens:", error);
      throw new WalletServiceError(
        "Failed to send tokens",
        WalletErrorCodes.UNKNOWN_ERROR,
        error
      );
    }
  }

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    const manager = this.ensureInitialized();

    try {
      const success = await manager.changePassword(
        request.publicKey,
        request.oldPassword,
        request.newPassword
      );

      if (!success) {
        throw new Error("Password change returned false");
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      throw new WalletServiceError(
        "Failed to change password",
        WalletErrorCodes.INVALID_PASSWORD,
        error
      );
    }
  }

  async getActiveWallet(): Promise<WalletInfo | null> {
    const manager = this.ensureInitialized();

    try {
      const wasmWallet = await manager.getActiveWallet();

      if (!wasmWallet) {
        return null;
      }

      return WasmTypeMapper.toWalletInfo(wasmWallet, true);
    } catch (error) {
      console.error("Failed to get active wallet:", error);
      throw new WalletServiceError(
        "Failed to get active wallet",
        WalletErrorCodes.UNKNOWN_ERROR,
        error
      );
    }
  }

  async setActiveWallet(publicKey: string): Promise<void> {
    const manager = this.ensureInitialized();

    try {
      const success = await manager.setActiveWallet(publicKey);

      if (!success) {
        throw new Error("Failed to set active wallet");
      }
    } catch (error) {
      console.error("Failed to set active wallet:", error);
      throw new WalletServiceError(
        "Failed to set active wallet",
        WalletErrorCodes.WALLET_NOT_FOUND,
        error
      );
    }
  }

  async refreshActiveWalletBalance(): Promise<TokenBalance[]> {
    const manager = this.ensureInitialized();

    try {
      const balances = await manager.refreshActiveWalletBalance();
      
      return balances;
    } catch (error) {
      console.error("Failed to refresh balance:", error);
      throw new WalletServiceError(
        "Failed to refresh balance",
        WalletErrorCodes.NETWORK_ERROR,
        error
      );
    }
  }

  async cleanupInactiveWallets(): Promise<void> {
    const manager = this.ensureInitialized();

    try {
      await manager.cleanupInactiveWallets();
    } catch (error) {
      console.error("Failed to cleanup wallets:", error);
      // We log but don't throw here since cleanup is not critical
      console.warn("Cleanup failed, but continuing...");
    }
  }
}