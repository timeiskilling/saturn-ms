import { Layers } from "lucide-react";

export function LoadingBundlesState() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-zinc-200">
      <div className="flex flex-col items-center gap-4">
        <Layers className="w-12 h-12 text-zinc-800 animate-pulse" />
        <p className="text-zinc-500 font-medium">Loading bundles...</p>
      </div>
    </div>
  );
}
