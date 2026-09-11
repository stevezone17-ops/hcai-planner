import React from "react";
import type { ScheduleStatus, ScheduleSource } from "../types";

interface HITLBadgeProps {
  status: ScheduleStatus;
  source?: ScheduleSource;
  locked?: boolean;
  originalStart?: string | null;
  currentStart?: string | null;
  compact?: boolean;
}

const formatTimeShort = (iso: string): string => {
  try {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return iso;
  }
};

const badgeConfig: Record<string, { label: string; className: string; icon: string }> = {
  LOCKED: {
    label: "Locked",
    className: "badge-locked",
    icon: "🔒",
  },
  PROPOSED: {
    label: "AI Suggested",
    className: "badge-ai",
    icon: "✨",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "badge-accepted",
    icon: "✓",
  },
  MODIFIED: {
    label: "Modified by You",
    className: "badge-modified",
    icon: "✎",
  },
  REJECTED: {
    label: "Rejected",
    className: "badge-rejected",
    icon: "✕",
  },
  COMPLETED: {
    label: "Completed",
    className: "badge-accepted",
    icon: "✓",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "badge-rejected",
    icon: "—",
  },
};

export function HITLBadge({
  status,
  source,
  locked,
  originalStart,
  currentStart,
  compact = false,
}: HITLBadgeProps) {
  const effectiveStatus = locked ? "LOCKED" : status;
  const config = badgeConfig[effectiveStatus] || badgeConfig.PROPOSED;

  const showTimeShift = status === "MODIFIED" && originalStart && currentStart;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${config.className} select-none`}
      >
        <span className="text-xs leading-none">{config.icon}</span>
        {!compact && config.label}
      </span>

      {showTimeShift && !compact && (
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          AI: {formatTimeShort(originalStart!)} → You: {formatTimeShort(currentStart!)}
        </span>
      )}

      {source === "AI" && status === "PROPOSED" && !locked && !compact && (
        <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
          Awaiting review
        </span>
      )}
    </div>
  );
}
