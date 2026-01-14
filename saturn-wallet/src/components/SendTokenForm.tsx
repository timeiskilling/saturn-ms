/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useSendTokens } from '../hooks/useWalletOperations';

type SendTokenFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
}

const SendTokenForm: React.FC<SendTokenFormProps> = () => {
    const { sendTokens, data, isLoading, error } = useSendTokens();
    const [inputMint, setInputMint] = useState('');
    const [inputAdress, setInputAdress] = useState('');

    const [amountOfInputMint, setAmountPriceOfInputMint] = useState(0);
    const [priceOfInputMint, setPriceOfInputMint] = useState(0);

    const mockUserTokens = [
        { mint: 'sol_mint_address', symbol: 'SOL', balance: 1.5 },
        { mint: 'usdc_mint_address', symbol: 'USDC', balance: 100 },
    ];

    const selectedToken = mockUserTokens.find(t => t.mint === inputMint);
    const currentBalance = selectedToken ? selectedToken.balance : 0;
    const isExceedsBalance = inputMint && amountOfInputMint > currentBalance;
    const isValidPubkey = inputAdress.length !== 32;

    return (
        <div>
            <div>
                <h2>Input address</h2>
                <div>
                    <input type="text" value={inputAdress}
                        onChange={(e) => setInputAdress(e.target.value)}
                        disabled={isLoading}
                    />
                    {isValidPubkey && (
                        <div style={{ color: 'red', fontSize: '12px' }}>
                            Invalid Address
                        </div>
                    )}
                </div>

                <div>
                    <input type="number" value={amountOfInputMint}
                        onChange={(e) => setAmountPriceOfInputMint(e.target.valueAsNumber)}
                        disabled={isLoading}
                    />
                    <select
                        value={inputMint}
                        onChange={(e) => setInputMint(e.target.value)}
                        disabled={isLoading}
                    >
                        <option value="" disabled>Select Token</option>
                        {mockUserTokens.map((token) => (
                            <option key={token.mint} value={token.mint}>
                                {token.symbol} (Bal: {token.balance})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <span>{priceOfInputMint ? priceOfInputMint : 0}</span>
                </div>

                {isExceedsBalance && (
                    <div style={{ color: 'red', fontSize: '12px' }}>
                        Max available: {currentBalance}
                    </div>
                )}

                <div>
                    <button disabled={isLoading || !inputMint || isExceedsBalance || isValidPubkey || amountOfInputMint <= 0 || !error}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SendTokenForm;