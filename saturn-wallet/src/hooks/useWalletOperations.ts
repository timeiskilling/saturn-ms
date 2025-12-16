import { useState, useCallback } from "react";
import { useWallet } from "../contexts/WalletContext";
import {
  type CreateWalletRequest,
  type CreateWalletResponse,
  type WalletInfo,
  type SendTokensRequest,
  WalletServiceError,
} from "../services/wallet/wallet_service";

interface OperationState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export const useCreateWallet = () => {
  const { walletService } = useWallet();
  const [state, setState] = useState<OperationState<CreateWalletResponse>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const createWallet = useCallback(
    async (request: CreateWalletRequest) => {
      if (!walletService) {
        setState({
          data: null,
          isLoading: false,
          error: "Wallet service is not initialized",
        });
        return null;
      }

      setState({ data: null, isLoading: true, error: null });

      try {
        const response = await walletService.createWallet(request);
        setState({ data: response, isLoading: false, error: null });
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof WalletServiceError
            ? error.message
            : "Failed to create wallet";

        setState({ data: null, isLoading: false, error: errorMessage });
        return null;
      }
    },
    [walletService]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    createWallet,
    reset,
  };
};

export const useWalletList = () => {
  const { walletService } = useWallet();
  const [state, setState] = useState<OperationState<WalletInfo[]>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchWallets = useCallback(async () => {
    if (!walletService) {
      setState({
        data: null,
        isLoading: false,
        error: "Wallet service is not initialized",
      });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const wallets = await walletService.listWallets();
      setState({ data: wallets, isLoading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof WalletServiceError
          ? error.message
          : "Failed to fetch wallets";
      setState({ data: null, isLoading: false, error: errorMessage });
    }
  }, [walletService]);

  return {
    ...state,
    fetchWallets,
    refetch: fetchWallets,
  };
};

export const useSendTokens = () => {
  const { walletService } = useWallet();
  const [state, setState] = useState<OperationState<string>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const sendTokens = useCallback(
    async (request: SendTokensRequest) => {
      if (!walletService) {
        setState({
          data: null,
          isLoading: false,
          error: "Wallet service is not initialized",
        });
        return null;
      }

      setState({ data: null, isLoading: true, error: null });

      try {
        const signature = await walletService.sendTokens(request);
        setState({ data: signature, isLoading: false, error: null });
        return signature;
      } catch (error) {
        const errorMessage =
          error instanceof WalletServiceError
            ? error.message
            : "Failed to send tokens";

        setState({ data: null, isLoading: false, error: errorMessage });
        return null;
      }
    },
    [walletService]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    sendTokens,
    reset,
  };
};

export const useActiveWallet = () => {
  const { walletService } = useWallet();
  const [state, setState] = useState<OperationState<WalletInfo>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchActiveWallet = useCallback(async () => {
    if (!walletService) {
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const wallet = await walletService.getActiveWallet();
      setState({ data: wallet, isLoading: false, error: null });
    } catch (error) {
      const errorMessage =
        error instanceof WalletServiceError
          ? error.message
          : "Failed to fetch active wallet";

      setState({ data: null, isLoading: false, error: errorMessage });
    }
  }, [walletService]);

  const setActive = useCallback(
    async (publicKey: string) => {
      if (!walletService) {
        return false;
      }

      try {
        await walletService.setActiveWallet(publicKey);
        await fetchActiveWallet();
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof WalletServiceError
            ? error.message
            : "Failed to set active wallet";

        setState((prev) => ({ ...prev, error: errorMessage }));
        return false;
      }
    },
    [walletService, fetchActiveWallet]
  );

  return {
    ...state,
    fetchActiveWallet,
    setActive,
    refetch: fetchActiveWallet,
  };
};

export const useRefreshBalance = () => {
  const { walletService } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const refreshBalance = useCallback(async (publicKey?: string) => {
    if (!walletService) {
      return null;
    }

    setIsLoading(true);

    try {
      const balance = publicKey
        ? await walletService.getBalance(publicKey)
        : await walletService.refreshActiveWalletBalance();

      return balance;
    } catch (error) {
      console.error("Failed to refresh balance:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [walletService]);

  return {
    refreshBalance,
    isLoading
  }
};
