import React from "react";
import { ScheduleStatus } from "../types";
import { Sparkles, CheckCircle, Edit3, Lock, XCircle, CheckSquare } from "lucide-react";

interface StatusBadgeProps {
  status: ScheduleStatus;
  locked?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, locked, className = "" }) => {
  if (locked || status === "LOCKED") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium badge-locked ${className}`}>
        <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span>Locked</span>
      </span>
    );
  }

  switch (status) {
    case "PROPOSED":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium badge-ai ${className}`}>
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>AI Suggested</span>
        </span>
      );
    case "ACCEPTED":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium badge-accepted ${className}`}>
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Accepted</span>
        </span>
      );
    case "MODIFIED":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium badge-modified ${className}`}>
          <Edit3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Modified by You</span>
        </span>
      );
    case "REJECTED":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium badge-rejected ${className}`}>
          <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          <span>Rejected</span>
        </span>
      );
    case "COMPLETED":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${className}`}>
          <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
          <span>Completed</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 ${className}`}>
          <span>{status}</span>
        </span>
      );
  }
};
