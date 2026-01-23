import React, { useEffect, useState } from 'react';
import { useActiveWallet } from '../hooks/useWalletOperations'; 
import { useBalance } from '../contexts/WalletContext';
// import { formatBalance } from '../services/formator';


type BuyTokenFormProps = {
    onSuccess?: () => void;
};

const mockAvailableTokens = [
    { mint: 'sol_mint_address', symbol: 'SOL', name: 'Solana', mockPrice: 145.50 },
    { mint: 'usdc_mint_address', symbol: 'USDC', name: 'USD Coin', mockPrice: 1.00 },
    { mint: 'bonk_mint_address', symbol: 'BONK', name: 'Bonk', mockPrice: 0.000024 },
    { mint: 'wif_mint_address', symbol: 'WIF', name: 'dogwifhat', mockPrice: 3.50 },
];

const BuyTokenForm: React.FC<BuyTokenFormProps> = ({ onSuccess }) => {
    const {
        data: walletInfo,
        error: walletError,
        isLoading: walletLoading,
        fetchActiveWallet
    } = useActiveWallet();

    const balance = useBalance();

    const [inputMint, setInputMint] = useState('');
    const [amountInput, setAmountInput] = useState<string>('');
    
    const [isBuying, setIsBuying] = useState(false);
    const [buyError, setBuyError] = useState<string | null>(null);
    const [txSignature, setTxSignature] = useState<string | null>(null);

    const selectedToken = mockAvailableTokens.find(t => t.mint === inputMint);
    const parsedAmount = parseFloat(amountInput);
    const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0;

    const estimatedCost = selectedToken && isValidAmount 
        ? (parsedAmount * selectedToken.mockPrice).toFixed(2) 
        : '0.00';

    
    useEffect(() => {
        fetchActiveWallet();
    }, []);

    useEffect(() => {
        balance.refreshBalance();
    }, []);


    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
            setAmountInput(val);
        }
    };

    const handleBuy = async () => {
        if (!walletInfo || !selectedToken || !isValidAmount) return;

        setIsBuying(true);
        setBuyError(null);

        try {
            console.log(`Buying ${parsedAmount} ${selectedToken.symbol} for wallet ${walletInfo.wasmInfo.pubkey}`);
            
            await new Promise((resolve) => setTimeout(resolve, 2000)); 

            const mockTx = "5x...mock...signature"; 
            setTxSignature(mockTx);
            
            if (onSuccess) onSuccess();
            
            setAmountInput('');
            setInputMint(''); 
            balance.refreshBalance(); 

        } catch (err) {
            console.error('Failed to buy tokens:', err);
            setBuyError("Transaction failed. Please try again.");
        } finally {
            setIsBuying(false);
        }
    };

    if (walletLoading) {
        return <div id="wallet-loading-state">Loading wallet information...</div>;
    }

    if (walletError) {
        return (
            <div id="wallet-error-state" style={{ color: 'red' }}>
                Error loading wallet: {walletError}
                <button id="wallet-retry-btn" onClick={fetchActiveWallet} style={{ marginLeft: '10px' }}>Retry</button>
            </div>
        );
    }

    if (txSignature) {
        const solanaFmUrl = `https://solana.fm/tx/${txSignature}`; 
        return (
            <div id="buy-success-container" style={{ color: 'green', marginTop: '10px', padding: '20px', textAlign: 'center' }}>
                <h3 id="success-header">Purchase Successful!</h3>
                <p>You bought {amountInput} {selectedToken?.symbol}</p>
                <div style={{ marginTop: '10px' }}>
                    <a
                        id="explorer-link"
                        href={solanaFmUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'underline', color: '#4CAF50' }}
                    >
                        View on Explorer ↗
                    </a>
                </div>
                <button 
                    onClick={() => { setTxSignature(null); setAmountInput(''); }}
                    style={{ marginTop: '20px', padding: '8px 16px', cursor: 'pointer' }}
                >
                    Buy More
                </button>
            </div>
        );
    }

    if (!walletInfo) {
        return <div id="connect-wallet-message">Please connect your wallet first</div>;
    }

    const isBuyDisabled = isBuying || !inputMint || !isValidAmount;

    return (
        <div id="buy-token-widget-wrapper">
            <div id="buy-token-form-card">
                <h2 id="form-header">Buy Tokens (Stub)</h2>

                <div id="buyer-info-display" style={{ marginBottom: '1rem', fontSize: '14px', color: '#666' }}>
                    Buying for: <span id="buyer-pubkey">{walletInfo.wasmInfo.pubkey.slice(0, 4)}...{walletInfo.wasmInfo.pubkey.slice(-4)}</span>
                </div>

                {/* Token Selection */}
                <div id="token-selection-section" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="token-select-dropdown">Select Token</label>
                    <select
                        id="token-select-dropdown"
                        value={inputMint}
                        onChange={(e) => setInputMint(e.target.value)}
                        disabled={isBuying}
                        style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                    >
                        <option value="" disabled>Choose a token...</option>
                        {mockAvailableTokens.map((token) => (
                            <option key={token.mint} value={token.mint}>
                                {token.name} ({token.symbol})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Amount Section */}
                <div id="amount-section" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="amount-input">Amount to Buy</label>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <input
                            id="amount-input"
                            type="text"
                            inputMode="decimal"
                            value={amountInput}
                            onChange={handleAmountChange}
                            disabled={isBuying}
                            placeholder="0.00"
                            style={{ flex: 1, padding: '8px' }}
                        />
                        <div style={{ padding: '8px', background: '#f0f0f0', borderRadius: '4px', minWidth: '60px', textAlign: 'center' }}>
                            {selectedToken ? selectedToken.symbol : '---'}
                        </div>
                    </div>
                </div>

                {/* Stub Price Estimation */}
                {selectedToken && isValidAmount && (
                    <div id="price-estimation-display" style={{ marginBottom: '1rem', padding: '10px', background: '#f9f9f9', borderRadius: '4px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Price per token:</span>
                            <span>${selectedToken.mockPrice}</span>
                        </div>
                        <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <span>Estimated Cost:</span>
                            <span>${estimatedCost} USD</span>
                        </div>
                    </div>
                )}

                {/* Errors */}
                {buyError && (
                    <div id="buy-error-msg" style={{ color: 'red', fontSize: '12px', marginBottom: '1rem' }}>
                        Error: {buyError}
                    </div>
                )}

                {/* Submit Button */}
                <div id="submit-button-container">
                    <button
                        id="buy-tokens-btn"
                        onClick={handleBuy}
                        disabled={isBuyDisabled}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: isBuyDisabled ? '#ccc' : '#2196F3', // Blue for Buy, diff from Green for Send
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isBuyDisabled ? 'not-allowed' : 'pointer',
                            width: '100%'
                        }}
                    >
                        {isBuying ? 'Processing...' : `Buy ${selectedToken ? selectedToken.symbol : 'Tokens'}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BuyTokenForm;