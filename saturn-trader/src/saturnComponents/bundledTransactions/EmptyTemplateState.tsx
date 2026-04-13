import { Layers, Plus } from "lucide-react";

interface EmptyTemplateStateProps {
  handleAddTemplate: () => void;
}

export function EmptyTemplateState({ handleAddTemplate }: EmptyTemplateStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <Layers className="w-16 h-16 text-zinc-800 mb-4" />
      <h2 className="text-xl font-bold text-zinc-300">No Templates</h2>
      <p className="text-zinc-500 mt-2 mb-6 text-center max-w-md">
        You don't have any bundle templates yet. Create a new template to start
        building transaction sequences.
      </p>
      <button
        onClick={handleAddTemplate}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-[0_0_15px_rgba(37,99,235,0.2)] transition-all"
      >
        <Plus className="w-5 h-5" />
        Create First Template
      </button>
    </div>
  );
}
