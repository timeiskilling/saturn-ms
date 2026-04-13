import { CircleDashed, Plus } from "lucide-react";

interface EmptyTransactionsStateProps {
  handleAddTransaction: () => void;
}

export function EmptyTransactionsState({
  handleAddTransaction,
}: EmptyTransactionsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
      <CircleDashed className="w-12 h-12 text-zinc-700 mb-4" />
      <h3 className="text-lg font-medium text-zinc-300">
        No Transactions Yet
      </h3>
      <p className="text-zinc-500 mt-2 text-center max-w-sm mb-6">
        Start building your bundle strategy. You can add up to 4 atomic
        transactions.
      </p>
      <button
        onClick={handleAddTransaction}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg font-semibold transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add First Transaction
      </button>
    </div>
  );
}
