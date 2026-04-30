import { BasicCard } from "./card";
import { AnimatedTitle } from "@/components/ui/AnimatedTitle";
import { TokenOverview } from "./TokenOverview";

export function WalletSidebar() {
  return (
    <BasicCard
      className="w-90 h-full rounded-none border-y-0 border-l-0 shadow-none overflow-y-auto shrink-0 bg-zinc-950 pb-6"
      classNames={{
        content: "flex flex-col gap-1 mt-4 px-6",
      }}
    >
      <div className="flex flex-col w-full gap-4">
        <AnimatedTitle />
        <TokenOverview />
      </div>
    </BasicCard>
  );
}
