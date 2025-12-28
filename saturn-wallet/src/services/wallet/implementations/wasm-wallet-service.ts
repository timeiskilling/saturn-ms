import initWasm, {
  WasmWalletManager,
  create_wallet_manager,
  type JsWalletCreationResult,
  type WalletInfo as WasmWalletInfo,
  type UnlockWalletRequest as WasmUnlockRequest,
  type SendTokensRequest as WasmSendTokensRequest,
  type CreateWalletRequest as WasmCreateWalletRequest,
  type TokenBalance,
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
      console.log("WASM module initialized");

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
    request: CreateWalletRequest
  ): Promise<CreateWalletResponse> {
    const manager = this.ensureInitialized();

    try {
      const wasmRequest: WasmCreateWalletRequest = {
        password: request.password,
        display_name: request.name,
        bip39_passphrase: null,
        network: null,
        keystore_timeout_secs: null,
      };

      const response: JsWalletCreationResult = await manager.createWallet(
        wasmRequest
      );

      return {
        publicKey: response.pubkey,
        recoveryPhrase: response.recovery_phrase,
        name: request.name,
      };
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
      const wallets: WasmWalletInfo[] = await manager.listWallets();

      return wallets.map((wallet) => ({
        publicKey: wallet.pubkey.toString(),
        name: wallet.display_name || "Unnamed Wallet",
        balance: "0",
        isActive: false,
      }));
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
      const wasmRequest: WasmUnlockRequest = {
        pubkey: request.pubkey,
        password: request.password,
      };

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
      const balance: TokenBalance | undefined = await manager.getBalance(
        publicKey,
        mint
      );

      if (!balance) {
        return {
          publicKey,
          balance: "0",
          mint,
        };
      }

      return {
        publicKey,
        balance: balance.amount,
        mint: balance.mint,
      };
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
      const wasmRequest: WasmSendTokensRequest = {
        from: request.fromPubkey,
        to: request.toPubkey,
        amount: request.amount,
        mint: request.mint || "So11111111111111111111111111111111111111112",
      };

      const signature: string = await manager.sendTokens(wasmRequest);
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
      const success: boolean = await manager.changePassword(
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
      const wallet: WasmWalletInfo | undefined =
        await manager.getActiveWallet();

      if (!wallet) {
        return null;
      }

      return {
        publicKey: wallet.pubkey.toString(),
        name: wallet.display_name || "Unnamed Wallet",
        balance: "0", // Another balance call refactor
        isActive: true,
      };
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
      const success: boolean = await manager.setActiveWallet(publicKey);

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
      const success: TokenBalance[] = await manager.refreshActiveWalletBalance();

      if (!success) {
        throw new Error("Failed to refresh balance");
      }
      return success;
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
      console.warn("Cleanup failed, but continuing...");
    }
  }
}
