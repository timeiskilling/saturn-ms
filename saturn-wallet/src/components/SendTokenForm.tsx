import React, { useState } from 'react';
import { useSendTokens } from '../hooks/useWalletOperations';

type SendTokenFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
}

const SendTokenForm: React.FC<SendTokenFormProps> = ({ onSuccess, onCancel }) => {
    const { sendTokens, data, isLoading, error } = useSendTokens();
    const [inputMint, setInputMint] = useState('');
    const [outputMint, setOutputMint] = useState('');

    const [amountOfInputMint, setAmountPriceOfInputMint] = useState(0);
    const [amountOfOutputMint, setAmountPriceOfOutputMint] = useState(0);

    const [priceOfInputMint, setPriceOfInputMint] = useState(0);
    const [priceOfOutputMint, setPriceOfOutputMint] = useState(0);

    return (
        <div>
            <h2>Input Mint</h2>
            <div>
                <input type="number" value={amountOfInputMint} onChange={(e) => setAmountPriceOfInputMint(e.target.valueAsNumber)} disabled={isLoading} />
            </div>
        </div>
    );
};

export default SendTokenForm;