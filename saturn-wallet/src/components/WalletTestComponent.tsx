import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useCreateWallet } from '../hooks/useWalletOperations';

const WalletTestComponent: React.FC = () => {
    const { isInitialized, isLoading, error: initError } = useWallet();

    const {
        data: createdWallet,
        isLoading: isCreating,
        error: createError,
        createWallet,
        reset
    } = useCreateWallet();

    //test data
    const [password, setPassword] = useState('MySuperSecretPassword123!');
    const [walletName, setWalletName] = useState('My First Wasm Wallet');


    const handleCreateWallet = async () => {
        const result = await createWallet({
            password,
            name: walletName
        });

        if (result) {
            console.log('Wallet created successfully:', result);
        }
    }

    const handleReset = () => {
        reset();
        setPassword('');
        setWalletName('');
    };

    if (isLoading) {
        return (
            <div style={styles.container}>
                <h2>Test Wasm Wallet</h2>
                <div style={styles.statusBox}>
                    <span style={styles.loadingSpinner}></span>
                    <strong style={{ color: '#00FFBD' }}>Initializing wallet service...</strong>
                </div>
            </div>
        );
    }

    if (initError) {
        return (
            <div style={styles.container}>
                <h2>Test Wasm Wallet</h2>
                <div style={{ ...styles.statusBox, borderColor: 'red' }}>
                    <strong style={{ color: 'red' }}>Initialization Error:</strong>
                    <p>{initError}</p>
                    <small>Please check the console for details</small>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2>Test Wasm Wallet</h2>

            { }
            <div style={styles.statusBox}>
                Status: <strong style={{ color: '#00FFBD' }}>
                    {isInitialized ? '✅ Ready' : '⚠️ Not Ready'}
                </strong>
            </div>

            { }
            {!createdWallet && (
                <div style={styles.formContainer}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Wallet Name:</label>
                        <input
                            type="text"
                            value={walletName}
                            onChange={(e) => setWalletName(e.target.value)}
                            style={styles.input}
                            placeholder="Enter wallet name"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="Enter password"
                        />
                    </div>

                    {createError && (
                        <div style={styles.errorBox}>
                            <strong>Error:</strong> {createError}
                        </div>
                    )}

                    <button
                        onClick={handleCreateWallet}
                        disabled={!isInitialized || isCreating}
                        style={{
                            ...styles.button,
                            backgroundColor: isInitialized && !isCreating ? '#00FFBD' : '#555',
                            cursor: isInitialized && !isCreating ? 'pointer' : 'not-allowed',
                        }}
                    >
                        {isCreating ? '⏳ Creating...' : 'Create New Wallet'}
                    </button>
                </div>
            )}

            { }
            {createdWallet && (
                <div style={styles.resultContainer}>
                    <h3 style={{ color: '#00FFBD' }}>✅ Wallet Created Successfully!</h3>

                    <div style={styles.infoGroup}>
                        <small style={styles.label}>Wallet Name:</small>
                        <div style={styles.infoValue}>{createdWallet.name}</div>
                    </div>

                    <div style={styles.infoGroup}>
                        <small style={styles.label}>Public Key:</small>
                        <div style={styles.infoValue}>{createdWallet.publicKey}</div>
                    </div>

                    <div style={styles.warningBox}>
                        <strong style={{ color: 'red', display: 'block', marginBottom: '10px' }}>
                            SECRET RECOVERY PHRASE (SAVE THIS SECURELY!)
                        </strong>
                        <div style={{
                            fontFamily: 'monospace',
                            fontSize: '16px',
                            lineHeight: '1.8',
                            padding: '10px',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '5px'
                        }}>
                            {createdWallet.recoveryPhrase}
                        </div>
                    </div>

                    <button onClick={handleReset} style={styles.secondaryButton}>
                        Create Another Wallet
                    </button>
                </div>
            )}

            <br />
            <small style={{ color: '#666' }}>
                Open console (F12) for detailed logs
            </small>
        </div>
    );
};



const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
    },
    statusBox: {
        marginBottom: '20px',
        padding: '15px',
        background: '#222',
        borderRadius: '8px',
        border: '1px solid #333',
    },
    formContainer: {
        background: 'rgba(255,255,255,0.05)',
        padding: '20px',
        borderRadius: '10px',
        border: '1px solid #333',
    },
    formGroup: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        color: '#888',
        marginBottom: '5px',
        fontSize: '14px',
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        borderRadius: '5px',
        border: '1px solid #444',
        background: '#1a1a1a',
        color: '#fff',
    },
    button: {
        width: '100%',
        padding: '12px 20px',
        fontSize: '16px',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        marginTop: '10px',
    },
    secondaryButton: {
        width: '100%',
        padding: '10px 20px',
        fontSize: '14px',
        border: '1px solid #00FFBD',
        background: 'transparent',
        color: '#00FFBD',
        borderRadius: '8px',
        cursor: 'pointer',
        marginTop: '15px',
    },
    errorBox: {
        padding: '10px',
        background: '#330000',
        border: '1px solid red',
        borderRadius: '5px',
        color: 'red',
        marginBottom: '10px',
    },
    resultContainer: {
        marginTop: '20px',
        border: '1px solid #333',
        padding: '20px',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.05)',
    },
    infoGroup: {
        marginBottom: '15px',
    },
    infoValue: {
        fontFamily: 'monospace',
        wordBreak: 'break-all',
        padding: '10px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '5px',
        marginTop: '5px',
    },
    warningBox: {
        background: '#330000',
        padding: '15px',
        borderRadius: '8px',
        border: '2px solid red',
        marginTop: '15px',
    },
    loadingSpinner: {
        display: 'inline-block',
        marginRight: '10px',
    },
};

export default WalletTestComponent;
