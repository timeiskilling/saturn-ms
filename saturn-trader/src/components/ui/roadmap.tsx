import React from "react";
import { cn } from "../../lib/utils";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export type RoadmapStatus = "completed" | "in-progress" | "planned";

export interface RoadmapItem {
  id: string;
  title: string;
  description?: string;
  status: RoadmapStatus;
  date?: string;
}

export interface RoadmapProps extends React.HTMLAttributes<HTMLDivElement> {
  items: RoadmapItem[];
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    lineColor: "bg-green-500",
  },
  "in-progress": {
    icon: Clock,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    lineColor: "bg-blue-500",
  },
  planned: {
    icon: Circle,
    color: "text-zinc-500",
    bgColor: "bg-zinc-800",
    borderColor: "border-zinc-700",
    lineColor: "bg-zinc-800",
  },
};

export const Roadmap = React.forwardRef<HTMLDivElement, RoadmapProps>(
  ({ className, items, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("relative pl-8 sm:pl-32 py-6", className)} {...props}>
        {/* Vertical line connecting the items */}
        <div className="absolute left-[39px] sm:left-[143px] top-8 bottom-8 w-px bg-zinc-800" />

        <div className="space-y-12">
          {items.map((item, index) => {
            const StatusIcon = statusConfig[item.status].icon;
            const isLast = index === items.length - 1;

            return (
              <div key={item.id} className="relative group">
                {/* Connecting Line Override for completed/in-progress */}
                {!isLast && item.status === "completed" && (
                  <div
                    className={cn(
                      "absolute left-[-23px] sm:left-[-15px] top-8 bottom-[-48px] w-px z-0",
                      statusConfig[item.status].lineColor
                    )}
                  />
                )}

                {/* Desktop Date (Left Side) */}
                <div className="hidden sm:block absolute left-[-130px] top-1.5 w-24 text-right">
                  {item.date && (
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      {item.date}
                    </span>
                  )}
                </div>

                {/* Status Indicator Icon */}
                <div
                  className={cn(
                    "absolute left-[-31px] sm:left-[-23px] top-1 flex h-8 w-8 items-center justify-center rounded-full border z-10 transition-colors",
                    statusConfig[item.status].bgColor,
                    statusConfig[item.status].borderColor
                  )}
                >
                  <StatusIcon className={cn("h-4 w-4", statusConfig[item.status].color)} />
                </div>

                {/* Content Card */}
                <div className="flex flex-col ml-6">
                  {/* Mobile Date */}
                  {item.date && (
                    <span className="sm:hidden text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
                      {item.date}
                    </span>
                  )}

                  <div className="flex flex-col gap-1">
                    <h3
                      className={cn(
                        "text-base font-semibold transition-colors",
                        item.status === "completed" ? "text-zinc-200" : "text-zinc-400",
                        item.status === "in-progress" && "text-zinc-100"
                      )}
                    >
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

Roadmap.displayName = "Roadmap";
