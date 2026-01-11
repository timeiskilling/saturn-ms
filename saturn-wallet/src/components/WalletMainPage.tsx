import React, { useEffect, useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useActiveWallet, useWalletList } from '../hooks/useWalletOperations';
import { WalletInfoHelpers, type UIWalletInfo } from '../services/wallet/wallet_service';
import CreateWalletForm from './CreateWalletForm';
import NoiseOverlay from '../effects/noise';



const WalletMainPage: React.FC = () => {
    const { isInitialized, isLoading: serviceLoading, error: serviceError } = useWallet();

    const { data: wallets, isLoading: walletsLoading, error: walletError, fetchWallets } = useWalletList();

    const { data: activeWallet, setActive } = useActiveWallet();

    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        if (isInitialized) {
            fetchWallets();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInitialized])


    const handleCreateClick = () => {
        // setShowCreateForm(prev => !prev)
        setShowCreateForm(true);
    };

    const handleWalletCreated = async () => {
        setShowCreateForm(false);
        await fetchWallets();
    };

    const handleCancelCreate = () => {
        setShowCreateForm(false);
    };

    const handleSelectWallet = async (publicKey: string) => {
        console.log("=== DEBUG START ===");
        console.log("1. publicKey parameter:", publicKey);
        console.log("2. publicKey length:", publicKey.length);
        console.log("3. publicKey char codes:", Array.from(publicKey).map((c, i) =>
            `${i}: ${c} (${c.charCodeAt(0)})`
        ).join(', '));

        // Create a fresh copy of the string to rule out reference issues
        const freshCopy = String(publicKey);
        console.log("4. Fresh copy:", freshCopy);
        console.log("5. Are they equal?:", publicKey === freshCopy);

        console.log("=== DEBUG END ===");
        console.log("Attempting to set active wallet:", freshCopy);

        let success = await setActive(freshCopy);
        // console.timeEnd("setActive");

        if (!success) {
            console.log("Manager busy, waiting and retrying...");
            await new Promise(resolve => setTimeout(resolve, 200));
            success = await setActive(publicKey);
        }

        if (success) {
            console.log('Active wallet changed:', publicKey);
        } else {
            console.error('Failed to set active wallet after retry');
        }
    };


    if (serviceLoading) {
        return (
            <div style={styles.container}>
                <div style={styles.centerContent}>
                    <div style={styles.spinner}>⏳</div>
                    <h2>Init service wallet...</h2>
                    <p style={styles.hint}>Loading WebAssembly module</p>
                </div>
            </div>
        );
    }

    if (serviceError) {
        return (
            <div style={styles.container}>
                <div style={styles.centerContent}>
                    <div style={styles.errorIcon}>❌</div>
                    <h2>Err initialization</h2>
                    <p style={styles.errorText}>{serviceError}</p>
                    <p style={styles.hint}>
                        Check console
                    </p>
                </div>
            </div>
        );
    }

    if (showCreateForm) {
        return (
            <div style={styles.container}>
                <CreateWalletForm
                    onSuccess={handleWalletCreated}
                    onCancel={handleCancelCreate}
                />
            </div>
        );
    }

    if (walletsLoading) {
        return (
            <div style={styles.container}>
                <div style={styles.centerContent}>
                    <div style={styles.spinner}>⏳</div>
                    <h2>loading wallets...</h2>
                </div>
            </div>
        );
    }

    if (walletError) {
        return (
            <div style={styles.container}>
                <div style={styles.centerContent}>
                    <div style={styles.errorIcon}>
                        <h2>Err loading wallet</h2>
                        <p style={styles.errorText}>{walletError}</p>
                        <button onClick={fetchWallets} style={styles.retryButton}>
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!wallets || wallets.length === 0) {
        return (
            <div style={styles.container}>
                <div style={styles.centerContent}>
                    <div style={styles.emptyIcon}>👛</div>
                    <h2>You haven't ant wallets</h2>
                    <p style={styles.hint}>
                        Create your first wallet for work in Solana blockchain
                    </p>
                    <button
                        onClick={handleCreateClick}
                        style={styles.primaryButton}
                    >
                        Create first wallet
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <NoiseOverlay />
            <div style={styles.header}>
                <h1>My wallets</h1>
                <button
                    onClick={handleCreateClick}
                    style={styles.primaryButton}
                >
                    + New wallet
                </button>
            </div>

            {activeWallet && (
                <div style={styles.activeWalletBanner}>
                    <div>
                        <strong>Active wallet:</strong>
                        <div style={styles.walletAddress}>
                            {WalletInfoHelpers.getDisplayName(activeWallet)}
                        </div>
                        <small style={styles.hint}>
                            {WalletInfoHelpers.getPublicKey(activeWallet)}
                        </small>
                    </div>
                </div>
            )}

            <div style={styles.walletsList}>
                {wallets.map((wallet) => {
                    const publicKey = WalletInfoHelpers.getPublicKey(wallet);
                    const isActive = activeWallet
                        ? WalletInfoHelpers.getPublicKey(activeWallet) === publicKey
                        : false;

                    return (
                        <WalletCard
                            key={publicKey}
                            wallet={wallet}
                            isActive={isActive}
                            onSelect={() => handleSelectWallet(publicKey)}
                        />
                    );
                })}
            </div>
        </div>
    );
};

interface WalletCardProps {
    wallet: UIWalletInfo; // UIWalletInfo
    isActive: boolean;
    onSelect: () => void;
}


const WalletCard: React.FC<WalletCardProps> = ({ wallet, isActive, onSelect }) => {
    const publicKey = WalletInfoHelpers.getPublicKey(wallet);
    const displayName = WalletInfoHelpers.getDisplayName(wallet);
    const isUnlocked = WalletInfoHelpers.isUnlocked(wallet);

    return (
        <div
            style={{
                ...styles.walletCard,
                ...(isActive ? styles.activeWalletCard : {}),
            }}
            onClick={onSelect}
        >
            <div style={styles.walletCardHeader}>
                <h3>{displayName}</h3>
                {isActive && <span style={styles.activeBadge}>Active</span>}
            </div>

            <div style={styles.walletCardBody}>
                <div style={styles.infoRow}>
                    <span style={styles.label}>Adress:</span>
                    <span style={styles.monospace}>{publicKey.slice(0, 8)}...{publicKey.slice(-8)}</span>
                </div>

                <div style={styles.infoRow}>
                    <span style={styles.label}>Статус:</span>
                    <span>{isUnlocked ? '🔓 Unlocked' : '🔒 Locked'}</span>
                </div>
            </div>
        </div>
    );
}

export default WalletMainPage;

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    centerContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
    },
    spinner: {
        fontSize: '48px',
        marginBottom: '20px',
    },
    errorIcon: {
        fontSize: '48px',
        marginBottom: '20px',
    },
    emptyIcon: {
        fontSize: '64px',
        marginBottom: '20px',
    },
    hint: {
        color: '#888',
        fontSize: '14px',
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: '14px',
    },
    primaryButton: {
        padding: '12px 24px',
        fontSize: '16px',
        backgroundColor: '#00FFBD',
        color: '#000',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'all 0.2s',
    },
    secondaryButton: {
        padding: '12px 24px',
        fontSize: '16px',
        backgroundColor: 'transparent',
        color: '#00FFBD',
        border: '1px solid #00FFBD',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    retryButton: {
        padding: '12px 24px',
        fontSize: '16px',
        backgroundColor: '#00FFBD',
        color: '#000',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        marginTop: '20px',
    },
    activeWalletBanner: {
        backgroundColor: 'rgba(0, 255, 189, 0.1)',
        border: '1px solid rgba(0, 255, 189, 0.3)',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px',
    },
    walletAddress: {
        fontSize: '18px',
        fontWeight: 'bold',
        marginTop: '5px',
        color: '#00FFBD',
    },
    walletsList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px',
    },
    walletCard: {
        backgroundColor: '#222',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    activeWalletCard: {
        borderColor: '#00FFBD',
        backgroundColor: 'rgba(0, 255, 189, 0.05)',
    },
    walletCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
    },
    activeBadge: {
        fontSize: '12px',
        padding: '4px 8px',
        backgroundColor: '#00FFBD',
        color: '#000',
        borderRadius: '4px',
        fontWeight: 'bold',
    },
    walletCardBody: {
        fontSize: '14px',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
    },
    label: {
        color: '#888',
    },
    monospace: {
        fontFamily: 'monospace',
    },
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
};
