import React from "react";
import { ParsedTask, formatDuration, formatDeadline } from "../utils/taskParser";
import type { PriorityType } from "../types";
import { Sparkles, Clock, Calendar, Tag, Check, Edit2, X } from "lucide-react";

interface TaskConfirmationModalProps {
  isOpen: boolean;
  parsedTask: ParsedTask | null;
  onConfirm: () => void;
  onEdit: () => void;
  onClose: () => void;
}

const priorityBadges: Record<PriorityType, { bg: string; text: string; border: string }> = {
  Critical: { bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
  High: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
  Medium: { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-[#5B5CE2] dark:text-[#797BF2]", border: "border-indigo-200 dark:border-indigo-800" },
  Low: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
};

export function TaskConfirmationModal({
  isOpen,
  parsedTask,
  onConfirm,
  onEdit,
  onClose,
}: TaskConfirmationModalProps) {
  if (!isOpen || !parsedTask) return null;

  const badge = priorityBadges[parsedTask.priority] || priorityBadges.Medium;

  return (
    <div className="fixed inset-0 bg-slate-900/30 dark:bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1F242C] rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="tcm-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] dark:bg-[#5B5CE2]/15 flex items-center justify-center text-[#5B5CE2] dark:text-[#797BF2]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 id="tcm-title" className="text-sm font-semibold text-slate-900 dark:text-white">
                Parsed Task Confirmation
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">AI extracted details from natural language</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Task Title */}
        <div className="p-5 space-y-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">Task Title</span>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{parsedTask.title}</p>
          </div>

          {/* Attributes Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400">Duration</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{formatDuration(parsedTask.duration_minutes)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                {parsedTask.priority}
              </span>
              <div>
                <p className="text-[10px] text-slate-400">Priority</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{parsedTask.priority}</p>
              </div>
            </div>

            {parsedTask.deadline && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <div>
                  <p className="text-[10px] text-slate-400">Deadline</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{formatDeadline(parsedTask.deadline)}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400">Category</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{parsedTask.category}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-[#FAFBFC] dark:bg-[#161B22]">
          <button
            onClick={onEdit}
            className="h-8 px-3 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Edit Full Form</span>
          </button>
          <button
            onClick={onConfirm}
            className="h-8 px-4 rounded-lg text-xs font-medium text-white bg-[#5B5CE2] hover:bg-[#4F46E5] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirm & Create</span>
          </button>
        </div>
      </div>
    </div>
  );
}
