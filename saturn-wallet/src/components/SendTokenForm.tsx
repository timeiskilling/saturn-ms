/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useActiveWallet, useSendTokens } from '../hooks/useWalletOperations';
import type { SendTokensParams } from '../services/wallet/wallet_service';
import { useBalance } from '../contexts/WalletContext';
import { formatBalance, getReadableAmount } from '../services/formator';

type SendTokenFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
}

const SendTokenForm: React.FC<SendTokenFormProps> = () => {
    const { sendTokens, data, isLoading, error } = useSendTokens();
    const [inputMint, setInputMint] = useState('');
    const [inputAddress, setInputAddress] = useState('');

    const {
        data: walletInfo,
        error: walletError,
        isLoading: walletLoading,
        fetchActiveWallet
    } = useActiveWallet();

    const balance = useBalance();
    const balances = balance.balances;

    const [amountInput, setAmountInput] = useState<string>('');
    const [priceOfInputMint, setPriceOfInputMint] = useState(0);

    const selectedToken = balances.find(t => t.mint === inputMint);
    const walletBalanceReadable = selectedToken ? getReadableAmount(selectedToken.raw, selectedToken.decimals) : 0;

    const parsedAmount = parseFloat(amountInput);
    const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0;
    const isExceedsBalance = isValidAmount && parsedAmount > walletBalanceReadable;

    const isValidPubkey = inputAddress.length >= 32 && inputAddress.length <= 44;
    const showAddressError = inputAddress.length > 0 && !isValidPubkey;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        if (val === '' || /^\d*\.?\d*$/.test(val)) {
            if (selectedToken && val.includes('.')) {
                const decimals = val.split('.')[1].length;
                if (decimals > selectedToken.decimals) {
                    return;
                }
            }
            setAmountInput(val);
        }
    };

    useEffect(() => {
        fetchActiveWallet();
    }, []);

    useEffect(() => {
        balance.refreshBalance();
    }, []);

    const handleSend = async () => {
        if (!walletInfo) {
            console.error('Wallet info is not available');
            return;
        }

        if (!inputAddress || !inputMint || parsedAmount <= 0) {
            console.error('Please fill all required fields');
            return;
        }

        const request: SendTokensParams = {
            fromPubkey: walletInfo.wasmInfo.pubkey,
            toPubkey: inputAddress,
            amount: parsedAmount.toString(),
            mint: inputMint
        };

        try {
            await sendTokens(request);
            setInputAddress('');
            setAmountInput('');
            setInputMint('');
        } catch (err) {
            console.error('Failed to send tokens:', err);
        }
    };

    // --- Loading State ---
    if (walletLoading) {
        return <div id="wallet-loading-state">Loading wallet information...</div>;
    }

    // --- Error State ---
    if (walletError) {
        return (
            <div id="wallet-error-state" style={{ color: 'red' }}>
                Error loading wallet: {walletError}
                <button id="wallet-retry-btn" onClick={fetchActiveWallet}>Retry</button>
            </div>
        );
    }

    // --- Success State ---
    if (data) {
        const solanaFmUrl = `https://solana.fm/tx/${data}`;
        return (
            <div id="transaction-success-container" style={{ color: 'green', marginTop: '10px' }}>
                <p id="success-message">Transaction success!</p>
                <a
                    id="explorer-link"
                    href={solanaFmUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'underline' }}
                >
                    Check in Solana FM ↗
                </a>
            </div>
        );
    }

    // --- Not Connected State ---
    if (!walletInfo) {
        return <div id="connect-wallet-message">Please connect your wallet first</div>;
    }

    const isSendDisabled =
        isLoading ||
        !inputMint ||
        isExceedsBalance ||
        !isValidPubkey ||
        parsedAmount <= 0 ||
        !walletInfo;

    // --- Main Form ---
    return (
        <div id="send-token-widget-wrapper">
            <div id="send-token-form-card">
                <h2 id="form-header">Send Tokens</h2>

                <div id="sender-info-display" style={{ marginBottom: '1rem', fontSize: '14px', color: '#666' }}>
                    From: <span id="sender-pubkey">{walletInfo.wasmInfo.pubkey}</span>
                </div>

                {/* Recipient Section */}
                <div id="recipient-section" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="recipient-input">Recipient Address</label>
                    <input
                        id="recipient-input"
                        type="text"
                        value={inputAddress}
                        onChange={(e) => setInputAddress(e.target.value)}
                        disabled={isLoading}
                        placeholder="Enter recipient address"
                        style={{ width: '100%', padding: '8px' }}
                    />
                    {showAddressError && (
                        <div id="recipient-error-msg" style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                            Invalid Solana address
                        </div>
                    )}
                </div>

                {/* Amount & Token Section */}
                <div id="amount-token-section" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="amount-input">Amount</label>
                    <div id="amount-input-group" style={{ display: 'flex', gap: '8px' }}>
                        <input
                            id="amount-input"
                            type="text"
                            inputMode="decimal"
                            value={amountInput}
                            onChange={handleAmountChange}
                            disabled={isLoading}
                            placeholder="0.00"
                            style={{ flex: 1, padding: '8px' }}
                        />
                        <select
                            id="token-select-dropdown"
                            value={inputMint}
                            onChange={(e) => setInputMint(e.target.value)}
                            disabled={isLoading}
                            style={{ padding: '8px' }}
                        >
                            <option value="" disabled>Select Token</option>
                            {balances.map((token) => {
                                const tokenVal = getReadableAmount(token.raw, token.decimals);
                                const formattedVal = formatBalance(tokenVal);
                                return (
                                    <option key={token.mint} value={token.mint}>
                                        {token.symbol} ({formattedVal})
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {/* Price Estimation */}
                {priceOfInputMint > 0 && (
                    <div id="price-estimation-display" style={{ marginBottom: '1rem', fontSize: '14px' }}>
                        ≈ ${priceOfInputMint.toFixed(2)}
                    </div>
                )}

                {/* Validation Errors */}
                {isExceedsBalance && (
                    <div id="balance-error-msg" style={{ color: 'red', fontSize: '12px', marginBottom: '1rem' }}>
                        Insufficient balance. Maximum available: {formatBalance(walletBalanceReadable)}
                    </div>
                )}

                {error && (
                    <div id="transaction-error-msg" style={{ color: 'red', fontSize: '12px', marginBottom: '1rem' }}>
                        Error: {error}
                    </div>
                )}

                {/* Submit Button */}
                <div id="submit-button-container">
                    <button
                        id="send-tokens-btn"
                        onClick={handleSend}
                        disabled={isSendDisabled}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: isSendDisabled ? '#ccc' : '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isSendDisabled ? 'not-allowed' : 'pointer',
                            width: '100%'
                        }}
                    >
                        {isLoading ? 'Sending...' : 'Send Tokens'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SendTokenForm;