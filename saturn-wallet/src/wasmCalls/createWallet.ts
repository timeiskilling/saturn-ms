import { WasmWalletManager } from 'encryptions-service';

type CreateWalletRequest = {
  password: string;
  bip39Passphrase?: string;
  displayName?: string;
  network?: string;
  keystoreTimeoutSecs?: number;
};

export async function createWallet(
  walletManager: WasmWalletManager, 
  password: string, 
  displayName: string, 
  bip39Passphrase?: string
): Promise<unknown> {
    
    const request: CreateWalletRequest = {
        password,
        bip39Passphrase,
        displayName
    };

    const data = await walletManager.createWallet(request);

    console.log("📦 Wasm RAW Data:", data);
    console.log("Type of data:", typeof data);

    return data;
}