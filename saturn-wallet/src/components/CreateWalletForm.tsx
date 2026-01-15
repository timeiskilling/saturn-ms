import React, { useState } from 'react';
import { useCreateWallet } from '../hooks/useWalletOperations';

type CreateWalletFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
}

const CreateWalletForm: React.FC<CreateWalletFormProps> = ({ onSuccess, onCancel }) => {
    const { createWallet, isLoading, error } = useCreateWallet();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [walletName, setWalletName] = useState('');

    const handleSubmit = async () => {
        if (password !== confirmPassword) {
            alert('Password doesnt match');
            return;
        }

        if (password.length < 12) {
            alert('Password must be at least 12 symbols');
            return;
        }

        const result = await createWallet({
            password,
            name: walletName || undefined
        });

        if (result) {
            alert(`Save this seed phrase:\n\n${result.recovery_phrase}\n`);
            onSuccess();
        }
    };

    return (
        <div style={styles.formContainer}>
            <h2>Creating new wallet</h2>

            <div style={styles.formGroup}>
                <label>Name wallet (optional)</label>
                <input
                    type="text"
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    placeholder="My main wallet"
                    style={styles.input}
                    disabled={isLoading}
                />
            </div>

            <div style={styles.formGroup}>
                <label>Password *</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 12 symbols"
                    style={styles.input}
                    disabled={isLoading}
                />
            </div>

            <div style={styles.formGroup}>
                <label>Confirmation password *</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    style={styles.input}
                    disabled={isLoading}
                />
            </div>

            {error && (
                <div style={styles.errorBox}>
                    {error}
                </div>
            )}

            <div style={styles.buttonGroup}>
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !password || !confirmPassword}
                    style={styles.primaryButton}
                >
                    {isLoading ? 'Creating...' : 'Create wallet'}
                </button>
                <button
                    onClick={onCancel}
                    disabled={isLoading}
                    style={styles.secondaryButton}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

// Styles are defined at the beginning of the file, before components, 
// to avoid hoisting issues in JavaScript. 
// See issue with CreateWalletForm freezing.
const styles: { [key: string]: React.CSSProperties } = {
    formContainer: {
        maxWidth: '500px',
        margin: '0 auto',
        backgroundColor: '#222',
        padding: '30px',
        borderRadius: '10px',
        border: '1px solid #333',
    },
    formGroup: {
        marginBottom: '20px',
    },
    input: {
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        border: '1px solid #444',
        borderRadius: '6px',
        marginTop: '5px',
        boxSizing: 'border-box',
    },
    errorBox: {
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        border: '1px solid rgba(255, 0, 0, 0.3)',
        borderRadius: '6px',
        padding: '12px',
        color: '#ff6b6b',
        marginBottom: '15px',
    },
    buttonGroup: {
        display: 'flex',
        gap: '10px',
        marginTop: '20px',
    },
    primaryButton: {
        flex: 1,
        padding: '12px 24px',
        fontSize: '16px',
        backgroundColor: '#00FFBD',
        color: '#000',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    secondaryButton: {
        flex: 1,
        padding: '12px 24px',
        fontSize: '16px',
        backgroundColor: 'transparent',
        color: '#00FFBD',
        border: '1px solid #00FFBD',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
};

export default CreateWalletForm;