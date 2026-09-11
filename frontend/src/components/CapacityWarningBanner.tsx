import React from "react";
import type { ScheduleItem } from "../types";
import { api } from "../services/api";

interface CapacityWarningBannerProps {
  scheduleItems: ScheduleItem[];
  maxDailyMinutes?: number;
  onResolve: (action: string) => void;
}

export function CapacityWarningBanner({
  scheduleItems,
  maxDailyMinutes = 480,
  onResolve,
}: CapacityWarningBannerProps) {
  // Calculate total scheduled minutes for today
  const today = new Date().toISOString().split("T")[0];
  const todayItems = scheduleItems.filter((item) => {
    const itemDate = item.start_time.split("T")[0];
    return itemDate === today && item.status !== "REJECTED" && item.status !== "CANCELLED";
  });

  const totalMinutes = todayItems.reduce((sum, item) => {
    const start = new Date(item.start_time).getTime();
    const end = new Date(item.end_time).getTime();
    return sum + (end - start) / 60000;
  }, 0);

  const overflowMinutes = totalMinutes - maxDailyMinutes;

  if (overflowMinutes <= 0) return null;

  const hours = Math.floor(overflowMinutes / 60);
  const mins = Math.round(overflowMinutes % 60);
  const overflowLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const actions = [
    { id: "move_low", label: "Move Low Priority to Tomorrow", icon: "📤" },
    { id: "split_task", label: "Split Longest Task", icon: "✂️" },
    { id: "extend_hours", label: "Extend Working Hours (+2h)", icon: "🕐" },
    { id: "ai_optimize", label: "Let AI Optimize", icon: "✨" },
  ];

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/10 p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-sm shrink-0">
          ⚠️
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
            Schedule Over Capacity
          </h4>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
            <span className="font-bold">{overflowLabel}</span> of work cannot fit today.
            {todayItems.length} tasks scheduled, exceeding your {Math.floor(maxDailyMinutes / 60)}h daily limit.
          </p>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {actions.map((a) => (
              <button
                key={a.id}
                onClick={() => onResolve(a.id)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/15 transition-colors shadow-xs"
              >
                <span>{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
