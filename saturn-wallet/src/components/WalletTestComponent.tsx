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

    const [password, setPassword] = useState('MySuperSecretPassword123!');
    const [walletName, setWalletName] = useState('My First Wasm Wallet');


    const handleCreateWallet = async () => {
        const result = await createWallet({
            password,
            name: walletName
        });

        if (result) {
            console.log('Wallet created successfully:');
            console.log('Public Key:', result.pubkey);
            console.log('Recovery Phrase:', result.recovery_phrase);
        }
    };

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
                    <span style={styles.loadingText}>⏳</span>
                    <strong style={{ color: '#00FFBD' }}>
                        Initializing wallet service...
                    </strong>
                    <small style={{ display: 'block', marginTop: '10px', color: '#888' }}>
                        Loading WebAssembly module and setting up cryptography
                    </small>
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
                    <p style={{ marginTop: '10px' }}>{initError}</p>
                    <small style={{ display: 'block', marginTop: '10px', color: '#888' }}>
                        Please check the console for details. Make sure WASM file is available.
                    </small>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2>Test Wasm Wallet</h2>

            {/* Status of service */}
            <div style={styles.statusBox}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>
                        {isInitialized ? '✅' : '⚠️'}
                    </span>
                    <div>
                        <strong style={{ color: '#00FFBD' }}>
                            Status: {isInitialized ? 'Ready' : 'Not Ready'}
                        </strong>
                        <small style={{ display: 'block', color: '#888', marginTop: '5px' }}>
                            {isInitialized 
                                ? 'Wallet service is initialized and ready to use'
                                : 'Wallet service is not available'}
                        </small>
                    </div>
                </div>
            </div>

            {/* Form fot creating wallet  - shows only if wallet constructed */}
            {!createdWallet && (
                <div style={styles.formContainer}>
                    <h3 style={{ marginTop: 0, color: '#00FFBD' }}>Create New Wallet</h3>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Wallet Name:</label>
                        <input
                            type="text"
                            value={walletName}
                            onChange={(e) => setWalletName(e.target.value)}
                            style={styles.input}
                            placeholder="Enter wallet name"
                            disabled={!isInitialized || isCreating}
                        />
                        <small style={{ color: '#888', fontSize: '12px' }}>
                            A friendly name to identify this wallet
                        </small>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="Enter password"
                            disabled={!isInitialized || isCreating}
                        />
                        <small style={{ color: '#888', fontSize: '12px' }}>
                            Used to encrypt your private key. Must be strong!
                        </small>
                    </div>

                    {/* Show err if creating fail */}
                    {createError && (
                        <div style={styles.errorBox}>
                            <strong>❌ Error:</strong>
                            <p style={{ marginTop: '5px' }}>{createError}</p>
                        </div>
                    )}

                    <button
                        onClick={handleCreateWallet}
                        disabled={!isInitialized || isCreating || !password || !walletName}
                        style={{
                            ...styles.button,
                            backgroundColor: 
                                isInitialized && !isCreating && password && walletName
                                    ? '#00FFBD' 
                                    : '#555',
                            cursor: 
                                isInitialized && !isCreating && password && walletName
                                    ? 'pointer' 
                                    : 'not-allowed',
                        }}
                    >
                        {isCreating ? '⏳ Creating Wallet...' : '🔐 Create New Wallet'}
                    </button>
                </div>
            )}

            {/* Result creating */}
            {createdWallet && (
                <div style={styles.resultContainer}>
                    <h3 style={{ color: '#00FFBD', marginTop: 0 }}>
                        ✅ Wallet Created Successfully!
                    </h3>

                    <div style={styles.infoGroup}>
                        <small style={styles.label}>Wallet Name:</small>
                        <div style={styles.infoValue}>
                            {walletName}
                        </div>
                    </div>

                    <div style={styles.infoGroup}>
                        <small style={styles.label}>Public Key (Address):</small>
                        <div style={styles.infoValue}>
                            {createdWallet.pubkey}
                        </div>
                        <small style={{ color: '#888', fontSize: '12px', marginTop: '5px' }}>
                            This is your wallet address. Share it to receive tokens.
                        </small>
                    </div>

                    {/* Warning about recovery phrase */}
                    <div style={styles.warningBox}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '24px' }}>⚠️</span>
                            <strong style={{ color: 'red', fontSize: '16px' }}>
                                SECRET RECOVERY PHRASE
                            </strong>
                        </div>
                        
                        <p style={{ margin: '10px 0', lineHeight: '1.6' }}>
                            Write down these words in order and store them in a safe place. 
                            This is the ONLY way to recover your wallet if you forget your password!
                        </p>

                        <div style={{
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            lineHeight: '2',
                            padding: '15px',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '5px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            wordBreak: 'break-word'
                        }}>
                            {createdWallet.recovery_phrase}
                        </div>

                        <small style={{ 
                            display: 'block', 
                            marginTop: '10px', 
                            color: '#ff6b6b',
                            fontWeight: 'bold'
                        }}>
                            ⚠️ Never share this phrase with anyone!
                        </small>
                    </div>

                    <button onClick={handleReset} style={styles.secondaryButton}>
                        Create Another Wallet
                    </button>
                </div>
            )}

            <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                background: 'rgba(0,255,189,0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(0,255,189,0.3)'
            }}>
                <small style={{ color: '#888' }}>
                    💡 <strong>Tip:</strong> Open browser console (F12) to see detailed logs 
                    of all operations including WASM calls
                </small>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: '700px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
        padding: '25px',
        borderRadius: '10px',
        border: '1px solid #333',
    },
    formGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        color: '#aaa',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '500',
    },
    input: {
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        borderRadius: '6px',
        border: '1px solid #444',
        background: '#1a1a1a',
        color: '#fff',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
        outline: 'none',
    },
    button: {
        width: '100%',
        padding: '14px 20px',
        fontSize: '16px',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        marginTop: '10px',
        transition: 'all 0.2s',
    },
    secondaryButton: {
        width: '100%',
        padding: '12px 20px',
        fontSize: '14px',
        border: '1px solid #00FFBD',
        background: 'transparent',
        color: '#00FFBD',
        borderRadius: '8px',
        cursor: 'pointer',
        marginTop: '20px',
        transition: 'all 0.2s',
        fontWeight: '500',
    },
    errorBox: {
        padding: '12px',
        background: 'rgba(255,0,0,0.1)',
        border: '1px solid rgba(255,0,0,0.3)',
        borderRadius: '6px',
        color: '#ff6b6b',
        marginBottom: '15px',
    },
    resultContainer: {
        marginTop: '20px',
        border: '1px solid #333',
        padding: '25px',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.05)',
    },
    infoGroup: {
        marginBottom: '20px',
    },
    infoValue: {
        fontFamily: 'monospace',
        wordBreak: 'break-all',
        padding: '12px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '6px',
        marginTop: '5px',
        fontSize: '13px',
        lineHeight: '1.6',
    },
    warningBox: {
        background: 'rgba(255,0,0,0.1)',
        padding: '20px',
        borderRadius: '8px',
        border: '2px solid rgba(255,0,0,0.3)',
        marginTop: '20px',
    },
    loadingText: {
        display: 'inline-block',
        marginRight: '10px',
        fontSize: '20px',
    },
};

export default WalletTestComponent;