import { useState, useCallback } from "react";
import { useWallet } from "../contexts/WalletContext";
import {
  CreateWalletRequest,
  CreateWalletResponse,
  WalletInfo,
  SendTokensRequest,
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

