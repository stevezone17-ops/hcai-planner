import React from "react";
import { PriorityType } from "../types";
import { AlertCircle, AlertTriangle, Clock, Minus } from "lucide-react";

interface PriorityBadgeProps {
  priority: PriorityType;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = "" }) => {
  switch (priority) {
    case "Critical":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800/40 ${className}`}>
          <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
          <span>Critical</span>
        </span>
      );
    case "High":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40 ${className}`}>
          <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span>High</span>
        </span>
      );
    case "Medium":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/40 ${className}`}>
          <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          <span>Medium</span>
        </span>
      );
    case "Low":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 ${className}`}>
          <Minus className="w-3 h-3 text-slate-500" />
          <span>Low</span>
        </span>
      );
  }
};
