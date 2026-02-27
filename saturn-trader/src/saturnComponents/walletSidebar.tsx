import { BasicCard } from "./card";
import { ConnectBox, usePhantom } from "@phantom/react-sdk";
import { useSolanaBalance } from "../hooks/useSolanaBalance";

export function WalletSidebar() {
  const { isConnected } = usePhantom();
  const balance = useSolanaBalance();

  return (
    <BasicCard
      className="w-90 h-full rounded-none border-y-0 border-l-0 shadow-none overflow-y-auto shrink-0 bg-zinc-950"
      classNames={{
        content: "flex flex-col gap-1 mt-4 px-6",
      }}
    >
      <div className="flex flex-col w-full">
        <ConnectBox transparent />

        {isConnected && (
          <div className="mt-6 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
            <h4 className="text-zinc-400 text-sm font-medium mb-1">
              Solana Balance
            </h4>
            <p className="text-white text-xl font-bold">
              {balance !== null ? `${balance.toFixed(4)} SOL` : "Loading..."}
            </p>
          </div>
        )}
      </div>
    </BasicCard>
  );
}
