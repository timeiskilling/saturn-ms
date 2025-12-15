import React, { createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import { type IWalletService } from '../services/wallet/wallet_service';

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
                setState(prev => ({ ...prev, isLoading: true, error: null }));

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

    const clearError = () => {
        setState(prev => ({ ...prev, error: null }));
    };

    const value: WalletContextValue = {
        ...state,
        walletService: state.isInitialized ? walletService : null,
        clearError,
    };
    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWallet = (): WalletContextValue => {
    const context = useContext(WalletContext);

    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}