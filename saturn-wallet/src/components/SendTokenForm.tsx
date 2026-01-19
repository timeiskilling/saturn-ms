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

    const walletBalanceReadable = selectedToken ? parseFloat(selectedToken.amount) : 0;

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

    if (walletLoading) {
        return <div>Loading wallet information...</div>;
    }

    if (walletError) {
        return (
            <div style={{ color: 'red' }}>
                Error loading wallet: {walletError}
                <button onClick={fetchActiveWallet}>Retry</button>
            </div>
        );
    }

    if (data) {
        const solanaFmUrl = `https://solana.fm/tx/${data}`;

        return (
            <div style={{ color: 'green', marginTop: '10px' }}>
                <p>Transaction success!</p>
                <a
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


    if (!walletInfo) {
        return <div>Please connect your wallet first</div>;
    }

    const isSendDisabled =
        isLoading ||
        !inputMint ||
        isExceedsBalance ||
        !isValidPubkey ||
        parsedAmount <= 0 ||
        !walletInfo;

    return (
        <div>
            <div>
                <h2>Send Tokens</h2>

                <div style={{ marginBottom: '1rem', fontSize: '14px', color: '#666' }}>
                    From: {walletInfo.wasmInfo.pubkey}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label>Recipient Address</label>
                    <input
                        type="text"
                        value={inputAddress}
                        onChange={(e) => setInputAddress(e.target.value)}
                        disabled={isLoading}
                        placeholder="Enter recipient address"
                        style={{ width: '100%', padding: '8px' }}
                    />
                    {showAddressError && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                            Invalid Solana address
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label>Amount</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={amountInput}
                            onChange={handleAmountChange}
                            disabled={isLoading}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            style={{ flex: 1, padding: '8px' }}
                        />
                        <select
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
                                        {token.symbol} (Balance: {formattedVal})
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {priceOfInputMint > 0 && (
                    <div style={{ marginBottom: '1rem', fontSize: '14px' }}>
                        ≈ ${priceOfInputMint.toFixed(2)}
                    </div>
                )}

                {isExceedsBalance && (
                    <div style={{ color: 'red', fontSize: '12px', marginBottom: '1rem' }}>
                        Insufficient balance. Maximum available: {formatBalance(walletBalanceReadable)}
                    </div>
                )}

                {error && (
                    <div style={{ color: 'red', fontSize: '12px', marginBottom: '1rem' }}>
                        Error: {error}
                    </div>
                )}

                <div>
                    <button
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