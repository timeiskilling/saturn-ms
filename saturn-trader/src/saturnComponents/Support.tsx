import { useState, useLayoutEffect } from "react";
import { toast } from "sonner";

type Network =
  | "Solana"
  | "Ethereum"
  | "Bitcoin"
  | "HyperEVM"
  | "Base"
  | "BNB"
  | "Polygon"
  | "Tron";

interface WalletEntry {
  id: number;
  address: string;
  network: Network;
  label: string;
}

const NETWORK_COLORS: Record<
  Network,
  { bg: string; text: string; dot: string }
> = {
  Solana: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    dot: "bg-purple-400",
  },
  Ethereum: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  Bitcoin: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    dot: "bg-orange-400",
  },
  HyperEVM: { bg: "bg-sky-500/10", text: "text-sky-400", dot: "bg-sky-400" },
  Base: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    dot: "bg-indigo-400",
  },
  BNB: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    dot: "bg-yellow-400",
  },
  Polygon: {
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    dot: "bg-violet-400",
  },
  Tron: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
};

const DEFAULT_WALLETS: WalletEntry[] = [
  {
    id: 1,
    address: "Dq8yRzYAM8V8pvM28ExJESdqAsSgXmEzquFYpCYvWxy3",
    network: "Solana",
    label: "Solana Wallet",
  },
  {
    id: 2,
    address: "0xb94CA1023c5c5397E3843BF2b4FffE9d2055D3a0",
    network: "Ethereum",
    label: "ETH / ERC-20",
  },
  {
    id: 3,
    address: "bc1qfkr2xnwq0ehalpesdqdp0qm07dsrycpnj2h95p",
    network: "Bitcoin",
    label: "BTC",
  },
  {
    id: 4,
    address: "0xb94CA1023c5c5397E3843BF2b4FffE9d2055D3a0",
    network: "HyperEVM",
    label: "Hyper",
  },
];

function CopyButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      toast.success("Address copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      disabled={!address}
      title="Copy address"
      className={`shrink-0 p-2 rounded-md transition-all ${
        !address
          ? "text-zinc-700 cursor-not-allowed"
          : copied
            ? "text-green-400 bg-green-500/10"
            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
      }`}
    >
      {copied ? (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

export function Support() {
  const [isShortScreen, setIsShortScreen] = useState(false);

  useLayoutEffect(() => {
    const checkSize = () => setIsShortScreen(window.innerHeight < 600);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-zinc-950 overflow-y-auto scrollbar-hide items-center">
      <div
        className={`text-center shrink-0 px-4 transition-all duration-300 ${
          isShortScreen ? "pt-2 pb-1" : "pt-6 sm:pt-8 pb-2"
        }`}
      >
        <p
          className={`text-[10px] text-zinc-500 tracking-[0.2em] uppercase font-mono mb-1 ${isShortScreen ? "mt-1" : "mt-2"}`}
        >
          Project Infrastructure
        </p>
        <h1
          className={`${isShortScreen ? "text-xl" : "text-2xl sm:text-3xl"} font-medium text-zinc-200 tracking-tight font-mono`}
        >
          Support the Development
        </h1>
      </div>
      {!isShortScreen && (
        <div className="w-full max-w-2xl px-4 mt-5">
          <div className="relative p-6 sm:p-8 bg-zinc-900/60 border border-zinc-800 rounded-xl shadow-sm">
            <h2 className="text-zinc-200 text-base font-mono mb-3 flex items-center gap-2">
              System Status: Simulation Mode
            </h2>
            <p className="text-zinc-400 text-sm font-mono leading-relaxed">
              Hey its STALь thank you for testing the platform. Please note that
              the application is currently operating in a simulation
              environment. This phase is critical to ensure all core mechanics
              and security measures are thoroughly validated before the full
              mainnet rollout.
            </p>
            <p className="text-zinc-400 text-sm font-mono leading-relaxed mt-4">
              Developing, securing, and maintaining this infrastructure requires
              significant independent effort and server resources etc. If you
              find value in the tools provided and wish to accelerate the
              development process, you can support the project directly.
            </p>
            <p className="text-zinc-400 text-sm font-mono leading-relaxed mt-4">
              Contributions sent to the addresses below will be used exclusively
              to cover ongoing server costs and fund the next phase of
              development.
            </p>
            <p className="text-amber-500/80 text-sm font-mono mt-6 font-medium">
              Your support makes the mainnet launch possible. Thank you.
            </p>
          </div>
        </div>
      )}

      {/* Wallet cards */}
      <div
        className={`w-full flex-1 flex justify-center items-start min-h-0 ${isShortScreen ? "pt-2" : "pt-6"}`}
      >
        <div className="w-full max-w-2xl px-4 flex flex-col gap-3 pb-8">
          <div className="flex items-center justify-between mb-1">
            <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.2em]">
              Contribution Addresses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DEFAULT_WALLETS.map((wallet) => {
              const colors = NETWORK_COLORS[wallet.network];
              return (
                <div
                  key={wallet.id}
                  className="flex flex-col gap-2 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-400 text-xs font-mono">
                      {wallet.label || `Wallet ${wallet.id}`}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase ${colors.bg} ${colors.text}`}
                    >
                      {wallet.network}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 min-w-0 bg-zinc-800/50 border border-zinc-800/50 rounded-lg px-3 py-2.5">
                      {wallet.address ? (
                        <p className="text-zinc-300 text-xs font-mono truncate">
                          {wallet.address}
                        </p>
                      ) : (
                        <p className="text-zinc-600 text-xs font-mono italic">
                          No address set
                        </p>
                      )}
                    </div>
                    <CopyButton address={wallet.address} />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-zinc-600 text-[10px] font-mono text-center mt-4 leading-relaxed">
            Double-check the network before sending. Transactions are
            irreversible.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Support;
