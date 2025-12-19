import initWasm, {
  WasmWalletManager,
  create_wallet_manager,
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
      const wasmRequset = {
        password: request.password,
        name: request.name,
      };

      const response = await manager.createWallet(wasmRequset);

      return {
        publicKey: response.public_key,
        recoveryPhrase: response.recovery_phrase,
        name: response.name,
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
      const wallets = await manager.listWallets();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return wallets.map((w: any) => ({
        publicKey: w.public_key,
        name: w.name,
        balance: w.balance || "0",
        isActive: w.is_active || false,
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
      await manager.unlockWallet(request.pubkey, request.password);
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
    mint: string = "SOL"
  ): Promise<WalletBalance> {
    const manager = this.ensureInitialized();

    try {
      const balance = manager.getBalance(publicKey, mint);

      return {
        publicKey,
        balance: balance.toString(),
        mint,
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
      const wasmRequest = {
        from_pubkey: request.fromPubkey,
        to_pubkey: request.toPubkey,
        amount: request.amount,
        mint: request.mint || "SOL",
      };

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
      await manager.changePassword(
        request.publicKey,
        request.oldPassword,
        request.newPassword
      );
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
      const wallet = await manager.getActiveWallet();

      if (!wallet) {
        return null;
      }
      return {
        publicKey: wallet.public_key,
        name: wallet.name,
        balance: wallet.balance || "0",
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
      await manager.setActiveWallet(publicKey);
    } catch (error) {
      console.error("Failed to set active wallet:", error);
      throw new WalletServiceError(
        "Failed to set active wallet",
        WalletErrorCodes.WALLET_NOT_FOUND,
        error
      );
    }
  }

  async refreshActiveWalletBalance(): Promise<WalletBalance> {
    const manager = this.ensureInitialized();

    try {
      const result = await manager.refreshActiveWalletBalance();

      return {
        publicKey: result.public_key,
        balance: result.balance,
        mint: result.mint || "SOL",
      };
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
