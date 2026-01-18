import initWasm, {
  WasmWalletManager,
  create_wallet_manager,
  type JsWalletCreationResult,
  type JsWalletInfo,
  type TokenBalance,
} from "encryptions-service";

import {
  type IWalletService,
  WalletServiceError,
  WalletErrorCodes,
  type CreateWalletParams,
  type UIWalletInfo,
  type SendTokensParams,
  type UnlockWalletParams,
  type ChangePasswordParams,
  WalletInfoHelpers,
  RequestAdapters,
} from "../wallet_service";

export interface WasmWalletServiceConfig {
  rpcUrl: string;
  jupiterUrl: string;
}

export class WasmWalletService implements IWalletService {
  private walletManager: WasmWalletManager  | null = null;
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

      await initWasm();
      console.log("WASM module initialized successfully");

      this.walletManager = await create_wallet_manager(
        this.config.rpcUrl,
        this.config.jupiterUrl
      );
      console.log("WalletManager instance created");

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

  private ensureInitialized(): WasmWalletManager  {
    if (!this.isReady() || !this.walletManager) {
      throw new WalletServiceError(
        "Wallet service is not initialized. Call initialize() first.",
        WalletErrorCodes.NOT_INITIALIZED
      );
    }
    return this.walletManager;
  }

  createWallet(params: CreateWalletParams): JsWalletCreationResult {
    const manager = this.ensureInitialized();

    try {
      const wasmRequest = RequestAdapters.toCreateWalletRequest(params);
      const result = manager.createWallet(wasmRequest);

      console.log(`✅ Wallet created: ${result.pubkey}`);
      return result;
    } catch (error) {
      console.error("❌ Error in createWallet:", error);
      throw new WalletServiceError(
        "Failed to create wallet",
        WalletErrorCodes.UNKNOWN_ERROR,
        error
      );
    }
  }

  listWallets(): UIWalletInfo[] {
    const manager = this.ensureInitialized();

    try {
      const wasmWallets = manager.listWallets();

      return wasmWallets.map((wasmInfo: JsWalletInfo) =>
        WalletInfoHelpers.fromWasm(wasmInfo, false)
      );
    } catch (error) {
      console.error("Failed to list wallets:", error);
      throw new WalletServiceError(
        "Failed to list wallets",
        WalletErrorCodes.UNKNOWN_ERROR,
        error
      );
    }
  }

  unlockWallet(params: UnlockWalletParams): boolean {
    const manager = this.ensureInitialized();

    try {
      const wasmRequest = RequestAdapters.toUnlockWalletRequest(params);
      const success = manager.unlockWallet(wasmRequest);

      if (!success) {
        throw new Error("Unlock operation returned false");
      }

      console.log(`Wallet unlocked: ${params.pubkey}`);
      return success;
    } catch (error) {
      console.error("Failed to unlock wallet:", error);
      throw new WalletServiceError(
        "Failed to unlock wallet. Check your password.",
        WalletErrorCodes.INVALID_PASSWORD,
        error
      );
    }
  }

  getBalance(
    publicKey: string,
    mint: string = "So11111111111111111111111111111111111111112"
  ): TokenBalance | undefined {
    const manager = this.ensureInitialized();

    try {
      const balance = manager.getBalance(publicKey, mint);

      if (balance) {
        console.log(
          `Balance for ${publicKey}: ${balance.amount} ${balance.symbol}`
        );
      }

      return balance;
    } catch (error) {
      console.error("Failed to get balance:", error);
      throw new WalletServiceError(
        "Failed to get balance",
        WalletErrorCodes.NETWORK_ERROR,
        error
      );
    }
  }

  async sendTokens(params: SendTokensParams): Promise<string> {
    const manager = this.ensureInitialized();

    try {
      const wasmRequest = RequestAdapters.toSendTokensRequest(params);
      const signature = await manager.sendTokens(wasmRequest);

      console.log(`Transaction sent: ${signature}`);
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

  changePassword(params: ChangePasswordParams): boolean {
    const manager = this.ensureInitialized();

    try {
      const success = manager.changePassword(
        params.publicKey,
        params.oldPassword,
        params.newPassword
      );

      if (!success) {
        throw new Error("Password change returned false");
      }

      console.log(`Password changed for: ${params.publicKey}`);
      return success;
    } catch (error) {
      console.error("Failed to change password:", error);
      throw new WalletServiceError(
        "Failed to change password. Check your current password.",
        WalletErrorCodes.INVALID_PASSWORD,
        error
      );
    }
  }

  getActiveWallet(): UIWalletInfo | null {
    const manager = this.ensureInitialized();

    try {
      const wasmWallet = manager.getActiveWallet();

      if (!wasmWallet) {
        return null;
      }

      return WalletInfoHelpers.fromWasm(wasmWallet, true);
    } catch (error) {
      console.error("Failed to get active wallet:", error);
      throw new WalletServiceError(
        "Failed to get active wallet",
        WalletErrorCodes.UNKNOWN_ERROR,
        error
      );
    }
  }

  setActiveWallet(publicKey: string): boolean {
    const manager = this.ensureInitialized();

    try {
      const success = manager.setActiveWallet(publicKey);

      if (!success) {
        throw new Error("Failed to set active wallet");
      }

      console.log(`Active wallet set to: ${publicKey}`);
      return success;
    } catch (error) {
      console.error("Failed to set active wallet:", error);
      throw new WalletServiceError(
        "Failed to set active wallet",
        WalletErrorCodes.WALLET_NOT_FOUND,
        error
      );
    }
  }

  async refreshBalance(publicKey: string): Promise<TokenBalance[]> {
    const manager = this.ensureInitialized();

    try {
      const balances = await manager.refreshBalance(publicKey);

      console.log(
        `✅ Refreshed ${balances.length} token balances for wallet: ${publicKey}`
      );
      
      return balances;
    } catch (error) {
      console.error(`Failed to refresh balance for ${publicKey}:`, error);
      throw new WalletServiceError(
        `Failed to refresh balance for wallet ${publicKey}`,
        WalletErrorCodes.NETWORK_ERROR,
        error
      );
    }
  }

  async refreshActiveWalletBalance(): Promise<TokenBalance[]> {
    const manager = this.ensureInitialized();

    try {
      const balances = await manager.refreshActiveWalletBalance();

      console.log(`✅ Refreshed ${balances.length} token balances for active wallet`);
      return balances;
    } catch (error) {
      console.error("Failed to refresh active wallet balance:", error);
      throw new WalletServiceError(
        "Failed to refresh active wallet balance",
        WalletErrorCodes.NETWORK_ERROR,
        error
      );
    }
  }

  async cleanupInactiveWallets(): Promise<void> {
    const manager = this.ensureInitialized();

    try {
      await manager.cleanupInactiveWallets();
      console.log("Inactive wallets cleaned up");
    } catch (error) {
      console.error("Failed to cleanup wallets:", error);
      console.warn("Cleanup failed, but continuing...");
    }
  }
}