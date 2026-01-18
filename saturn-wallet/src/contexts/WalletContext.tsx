import React, {createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { type IWalletService, type TokenBalance } from '../services/wallet/wallet_service';

interface WalletContextState {
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;
}

interface WalletContextValue extends WalletContextState {
    walletService: IWalletService | null;
    clearError: () => void;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

interface WalletProviderProps {
    children: ReactNode;
    walletService: IWalletService;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({
    children,
    walletService
}) => {
    const [state, setState] = useState<WalletContextState>({
        isInitialized: false,
        isLoading: true,
        error: null,
    })

    useEffect(() => {
        let isMounted = true;
        const initializeService = async () => {
            try {
                
                await walletService.initialize();

                if (isMounted) {
                    setState({
                        isInitialized: true,
                        isLoading: false,
                        error: null,
                    });
                }
            } catch (error) {
                console.error("Failed to initialize wallet service:", error);
                if (isMounted) {
                    setState({
                        isInitialized: false,
                        isLoading: false,
                        error: error instanceof Error ? error.message : 'Unknown initialization error',
                    });
                }
            }
        };

        initializeService();

        return () => {
            isMounted = false;
        };
    }, [walletService]);

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    const value = useMemo((): WalletContextValue => ({
        ...state,
        walletService: state.isInitialized ? walletService : null,
        clearError,
    }), [state, walletService, clearError]);

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};

interface BalanceContextState {
    balances: TokenBalance[];
    isLoading: boolean;
    lastUpdate: Date | null;
    error: string | null;
}

interface BalanceContextValue extends BalanceContextState {
    refreshBalance: () => Promise<void>;
    clearError: () => void;
    getTokenBalance: (mint: string) => TokenBalance | undefined;
}

const BalanceContext = createContext<BalanceContextValue | undefined>(undefined);

interface BalanceProviderProps {
    children: ReactNode;
    autoRefreshInterval?: number;
}
export const BalanceProvider: React.FC<BalanceProviderProps> = ({
    children, autoRefreshInterval
}) => {
    const { walletService, isInitialized } = useWallet();

    const [state, setState] = useState<BalanceContextState>({
        balances: [],
        isLoading: false,
        lastUpdate: null,
        error: null,
    })

    const refreshBalance = useCallback(async () => {
        if (!walletService) {
            console.log('Wallet service not available yet');
            return;
        }
        setState(prev => ({
            ...prev,
            isLoading: true,
            error: null
        }));

        try {
            console.log('Fetching active wallet balance...');
            const balances = await walletService.refreshActiveWalletBalance();
            console.log(`Successfully loaded ${balances.length} token balances`);

            setState({
                balances,
                isLoading: false,
                lastUpdate: new Date(),
                error: null,
            });
        } catch (error) {
            console.error('Failed to fetch balance:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to load balance';

            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
        }
    }, [walletService]);

    useEffect(() => {
        if (!isInitialized || !walletService) {
            return;
        }
        
        console.log('WalletService initialized, loading initial balance...');

        const timer = setTimeout(() => {
            refreshBalance();
        }, 0);

        return () => clearTimeout(timer);
        
    }, [isInitialized, walletService, refreshBalance]); 

    useEffect(() => {
        if (!autoRefreshInterval || !isInitialized) {
            return;
        }

        console.log(`Setting up auto-refresh every ${autoRefreshInterval}ms`);
        const intervalId = setInterval(() => {
            console.log('Auto-refreshing balance...');
            refreshBalance();
        }, autoRefreshInterval);

        return () => clearInterval(intervalId);
    }, [autoRefreshInterval, isInitialized, refreshBalance]);

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    const getTokenBalance = useCallback((mint: string): TokenBalance | undefined => {
        return state.balances.find(balance => balance.mint === mint);
    }, [state.balances]);

    const value = useMemo((): BalanceContextValue => ({
        ...state,
        refreshBalance,
        clearError,
        getTokenBalance,
    }), [state, refreshBalance, clearError, getTokenBalance]);

    return (
        <BalanceContext.Provider value={value}>
            {children}
        </BalanceContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBalance = (): BalanceContextValue => {
  const context = useContext(BalanceContext);

  if (context === undefined) {
    throw new Error(
      'useBalance must be used within a BalanceProvider. ' +
      'Make sure to wrap your component tree with BalanceProvider.'
    );
  }

  return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWallet = (): WalletContextValue => {
    const context = useContext(WalletContext);

    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}