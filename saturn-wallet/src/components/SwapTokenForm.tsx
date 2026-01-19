import React, { useState } from 'react';
import { useSendTokens } from '../hooks/useWalletOperations';
import { useBalance } from '../contexts/WalletContext';

type SwapTokenFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
}

const SwapTokenForm: React.FC<SwapTokenFormProps> = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sendTokens, data, isLoading, error } = useSendTokens();
    const balance = useBalance();
    balance.refreshBalance();
    const balances = balance.balances;

    const [inputMint, setInputMint] = useState('');
    const [outputMint, setOutputMint] = useState('');
    const [amountOfInputMint, setAmountPriceOfInputMint] = useState(0);
    const [amountOfOutputMint, setAmountPriceOfOutputMint] = useState(0);

    const [priceOfInputMint, setPriceOfInputMint] = useState(0);
    const [priceOfOutputMint, setPriceOfOutputMint] = useState(0);
    
    const mockAvailableTokens = [
        { mint: 'sol_mint_address', symbol: 'SOL' },
        { mint: 'usdc_mint_address', symbol: 'USDC' },
        { mint: 'bonk_mint_address', symbol: 'BONK' },
        { mint: 'wif_mint_address', symbol: 'WIF' },
    ];


    const getBalance = (mint: string) => {
        const userToken = balances.find(t => t.mint === mint);
        return userToken ? userToken.usd_price : 0;
    }

    const handleSwitch = () => {
        const oldInputMint = inputMint;
        setInputMint(outputMint);
        setOutputMint(oldInputMint);

        const oldInputAmount = amountOfInputMint;
        setAmountPriceOfInputMint(amountOfOutputMint);
        setAmountPriceOfOutputMint(oldInputAmount);

        const oldInputPrice = priceOfInputMint;
        setPriceOfInputMint(priceOfOutputMint);
        setPriceOfOutputMint(oldInputPrice);
    };

    return (
        <div>
            <div>
                <h2>Input Mint</h2>
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
                        {balances.map((token) => (
                            <option key={token.mint} value={token.mint}>
                                {token.symbol} (Bal: {getBalance(token.mint)})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <span>{priceOfInputMint ? priceOfInputMint : 0}</span>
                </div>
                
                <div>
                    <button 
                    onClick={handleSwitch}
                    disabled={isLoading}
                    title="Switch">
                        ⇅
                    </button>
                </div>

                <h2>Output Mint</h2>
                <div>
                    <input type="number" value={amountOfOutputMint}
                        onChange={(e) => setAmountPriceOfOutputMint(e.target.valueAsNumber)}
                        disabled={isLoading}
                    />
                    <select
                        value={outputMint}
                        onChange={(e) => setOutputMint(e.target.value)}
                        disabled={isLoading}>
                        <option value="" disabled>Select Token</option>
                        {mockAvailableTokens.map((token) => (
                            <option key={token.mint} value={token.mint}>
                                {token.symbol}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <span>{priceOfOutputMint ? priceOfOutputMint : 0}</span>
                </div>
                <div>
                    <button disabled={isLoading || !inputMint || !outputMint}>
                        Swap
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SwapTokenForm;