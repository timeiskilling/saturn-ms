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

  async createWallet(request: CreateWalletRequest): Promise<CreateWalletResponse> {
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
  unlockWallet(request: UnlockWalletRequest): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getBalance(publicKey: string, mint?: string): Promise<WalletBalance> {
    throw new Error("Method not implemented.");
  }
  sendTokens(request: SendTokensRequest): Promise<string> {
    throw new Error("Method not implemented.");
  }
  changePassword(request: ChangePasswordRequest): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getActiveWallet(): Promise<WalletInfo | null> {
    throw new Error("Method not implemented.");
  }
  setActiveWallet(publicKey: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  refreshActiveWalletBalance(): Promise<WalletBalance> {
    throw new Error("Method not implemented.");
  }
  cleanupInactiveWallets(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
