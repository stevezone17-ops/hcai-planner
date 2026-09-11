import React, { useState } from "react";

interface RejectionModalProps {
  isOpen: boolean;
  taskTitle: string;
  onReject: (reason: string, comment?: string) => void;
  onClose: () => void;
}

const REJECTION_REASONS = [
  { id: "wrong_time", label: "Wrong time", icon: "🕐" },
  { id: "too_much_workload", label: "Too much workload", icon: "📋" },
  { id: "deadline_changed", label: "Deadline changed", icon: "📅" },
  { id: "personal_commitment", label: "Personal commitment", icon: "🏠" },
  { id: "prefer_another_time", label: "Prefer another time", icon: "↔️" },
  { id: "duration_inaccurate", label: "Duration inaccurate", icon: "⏱️" },
  { id: "other", label: "Other", icon: "💬" },
];

export function RejectionModal({ isOpen, taskTitle, onReject, onClose }: RejectionModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedReason) return;
    onReject(selectedReason, comment || undefined);
    setSelectedReason("");
    setComment("");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/30 dark:bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#1F242C] rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-md animate-in fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rejection-title"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/15 flex items-center justify-center text-xs">✕</span>
            <h3 id="rejection-title" className="text-sm font-semibold text-slate-900 dark:text-white">Reject Proposal</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
            <span className="font-medium text-slate-700 dark:text-slate-300">{taskTitle}</span>
          </p>
        </div>

        {/* Reasons */}
        <div className="px-5 pb-3">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mb-2">Why are you rejecting?</p>
          <div className="grid grid-cols-2 gap-1.5">
            {REJECTION_REASONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedReason(r.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                  selectedReason === r.id
                    ? "bg-[#EEF2FF] dark:bg-[#5B5CE2]/15 text-[#5B5CE2] dark:text-[#797BF2] font-semibold ring-1 ring-[#5B5CE2]/30"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <span className="text-sm">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Comment */}
        {selectedReason === "other" && (
          <div className="px-5 pb-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more..."
              className="w-full h-16 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none focus:ring-2 focus:ring-[#5B5CE2]/30 focus:border-[#5B5CE2] outline-none"
            />
          </div>
        )}

        {/* Actions */}
        <div className="px-5 pb-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-8 px-3 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason}
            className="h-8 px-4 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
          >
            Reject Proposal
          </button>
        </div>
      </div>
    </div>
  );
}
