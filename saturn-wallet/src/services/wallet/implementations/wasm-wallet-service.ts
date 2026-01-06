import initWasm, {
  WasmWalletManager,
  create_wallet_manager,
  type JsWalletCreationResult,
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

  private ensureInitialized(): WasmWalletManager {
    if (!this.isReady() || !this.walletManager) {
      throw new WalletServiceError(
        "Wallet service is not initialized. Call initialize() first.",
        WalletErrorCodes.NOT_INITIALIZED
      );
    }
    return this.walletManager;
  }

  async createWallet(
    params: CreateWalletParams
  ): Promise<JsWalletCreationResult> {
    console.log("🔷 WasmWalletService.createWallet called");
    console.log("🔷 Params:", params);

    const manager = this.ensureInitialized();
    console.log("🔷 Manager obtained:", manager);

    try {
      console.log("🔷 Converting params to WASM request...");
      const wasmRequest = RequestAdapters.toCreateWalletRequest(params);
      console.log("🔷 WASM request created:", wasmRequest);

      console.log("🔷 Calling manager.createWallet...");
      const result = await manager.createWallet(wasmRequest);
      console.log("🔷 Manager returned result:", result);

      console.log(`✅ Wallet created: ${result.pubkey}`);
      return result;
    } catch (error) {
      console.error("❌ Error in WasmWalletService.createWallet:", error);
      throw new WalletServiceError(
        "Failed to create wallet",
        WalletErrorCodes.UNKNOWN_ERROR,
        error
      );
    }
  }

  async listWallets(): Promise<UIWalletInfo[]> {
    const manager = this.ensureInitialized();

    try {
      const wasmWallets = await manager.listWallets();

      return wasmWallets.map((wasmInfo) =>
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

  async unlockWallet(params: UnlockWalletParams): Promise<void> {
    const manager = this.ensureInitialized();

    try {
      const wasmRequest = RequestAdapters.toUnlockWalletRequest(params);
      const success = await manager.unlockWallet(wasmRequest);

      if (!success) {
        throw new Error("Unlock operation returned false");
      }

      console.log(`Wallet unlocked: ${params.pubkey}`);
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
  ): Promise<TokenBalance | undefined> {
    const manager = this.ensureInitialized();

    try {
      const balance = await manager.getBalance(publicKey, mint);

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

  async changePassword(params: ChangePasswordParams): Promise<void> {
    const manager = this.ensureInitialized();

    try {
      const success = await manager.changePassword(
        params.publicKey,
        params.oldPassword,
        params.newPassword
      );

      if (!success) {
        throw new Error("Password change returned false");
      }

      console.log(`Password changed for: ${params.publicKey}`);
    } catch (error) {
      console.error("Failed to change password:", error);
      throw new WalletServiceError(
        "Failed to change password. Check your current password.",
        WalletErrorCodes.INVALID_PASSWORD,
        error
      );
    }
  }

  async getActiveWallet(): Promise<UIWalletInfo | null> {
    const manager = this.ensureInitialized();

    try {
      const wasmWallet = await manager.getActiveWallet();

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

  async setActiveWallet(publicKey: string): Promise<void> {
    const manager = this.ensureInitialized();

    try {
      const success = await manager.setActiveWallet(publicKey);

      if (!success) {
        throw new Error("Failed to set active wallet");
      }

      console.log(`Active wallet set to: ${publicKey}`);
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

      console.log(`Refreshed ${balances.length} token balances`);
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
      console.log("Inactive wallets cleaned up");
    } catch (error) {
      console.error("Failed to cleanup wallets:", error);
      console.warn("Cleanup failed, but continuing...");
    }
  }
}
