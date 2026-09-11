import React from "react";
import { Sparkles, Plus } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="py-12 px-6 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30 flex flex-col items-center justify-center space-y-3">
      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
        {icon || <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onAction}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
