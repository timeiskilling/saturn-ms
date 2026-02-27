import { useDiscoveredWallets, useConnect } from "@phantom/react-sdk";

function MyCustomWalletList() {
  const { wallets, isLoading } = useDiscoveredWallets();
  const { connect } = useConnect();

  if (isLoading)
    return <p className="text-zinc-500 text-sm">Serch wallet...</p>;

  return (
    <div className="flex flex-col gap-3 w-full mt-2">
      <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
        Chose Wallet
      </span>

      {wallets.map((wallet) => (
        <button
          key={wallet.name}
          onClick={() => connect({ provider: "injected" })}
          className="flex items-center gap-3 w-full p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
        >
          <img
            src={wallet.icon}
            alt={wallet.name}
            className="w-6 h-6 rounded-md"
          />
          <span className="text-zinc-200 font-medium">{wallet.name}</span>
        </button>
      ))}
    </div>
  );
}
