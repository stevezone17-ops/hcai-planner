import React, { useState } from "react";
import { api } from "../services/api";

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose: () => void;
}

interface StepData {
  planningFor: string;
  workStart: string;
  workEnd: string;
  productiveTime: string;
  sessionLength: string;
  breakLength: string;
}

const STEPS = [
  { title: "What are you planning for?", subtitle: "Tell us about your planning context" },
  { title: "Working hours", subtitle: "When do you usually start and end your day?" },
  { title: "Peak productivity", subtitle: "When are you most focused?" },
  { title: "Session preferences", subtitle: "How long do you usually work in one sitting?" },
  { title: "Break preferences", subtitle: "How long do you like your breaks?" },
  { title: "Ready to go!", subtitle: "We'll generate your first optimized schedule" },
];

const PLANNING_OPTIONS = [
  { id: "academic", label: "Academic / Coursework", icon: "📚" },
  { id: "work", label: "Work / Professional", icon: "💼" },
  { id: "mixed", label: "Mixed (Work + Personal)", icon: "🎯" },
  { id: "research", label: "Research / Thesis", icon: "🔬" },
];

const PRODUCTIVE_OPTIONS = [
  { id: "morning", label: "Morning (8–12)", icon: "🌅" },
  { id: "midday", label: "Midday (11–15)", icon: "☀️" },
  { id: "afternoon", label: "Afternoon (14–18)", icon: "🌤️" },
  { id: "evening", label: "Evening (17–22)", icon: "🌙" },
];

const SESSION_OPTIONS = ["30 min", "45 min", "60 min", "90 min", "120 min"];
const BREAK_OPTIONS = ["5 min", "10 min", "15 min", "20 min", "30 min"];

export function OnboardingWizard({ isOpen, onComplete, onClose }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<StepData>({
    planningFor: "academic",
    workStart: "09:00",
    workEnd: "18:00",
    productiveTime: "morning",
    sessionLength: "60 min",
    breakLength: "15 min",
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Save preferences to backend
      const sessionMin = parseInt(data.sessionLength) || 60;
      const breakMin = parseInt(data.breakLength) || 15;

      await Promise.all([
        api.preferences.update("preferred_focus_time", data.productiveTime === "morning" ? "Morning (09:00 - 12:00)" : data.productiveTime === "evening" ? "Evening (17:00 - 21:00)" : "Afternoon (13:00 - 17:00)"),
        api.preferences.update("preferred_session_minutes", String(sessionMin)),
        api.preferences.update("min_break_minutes", String(breakMin)),
        api.preferences.update("work_start", data.workStart),
        api.preferences.update("work_end", data.workEnd),
      ]);

      localStorage.setItem("hcai_onboarded", "true");
      onComplete();
    } catch {
      onComplete(); // proceed anyway
    } finally {
      setSaving(false);
    }
  };

  const isLastStep = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white dark:bg-[#1F242C] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Progress Bar */}
        <div className="h-1 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-[#5B5CE2] transition-all duration-300 rounded-r-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-start justify-between">
          <div>
            <p className="text-[10px] text-[#5B5CE2] dark:text-[#797BF2] font-bold uppercase tracking-wider mb-1">
              Step {step + 1} of {STEPS.length}
            </p>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{STEPS[step].title}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{STEPS[step].subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-5 min-h-[180px]">
          {step === 0 && (
            <div className="grid grid-cols-2 gap-2">
              {PLANNING_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setData({ ...data, planningFor: opt.id })}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    data.planningFor === opt.id
                      ? "bg-[#EEF2FF] dark:bg-[#5B5CE2]/15 border-[#5B5CE2]/30 ring-1 ring-[#5B5CE2]/20"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <span className="text-xl block mb-1.5">{opt.icon}</span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{opt.label}</p>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block mb-1.5">Start time</label>
                <input
                  type="time"
                  value={data.workStart}
                  onChange={(e) => setData({ ...data, workStart: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#5B5CE2]/30 focus:border-[#5B5CE2]"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block mb-1.5">End time</label>
                <input
                  type="time"
                  value={data.workEnd}
                  onChange={(e) => setData({ ...data, workEnd: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#5B5CE2]/30 focus:border-[#5B5CE2]"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-2">
              {PRODUCTIVE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setData({ ...data, productiveTime: opt.id })}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    data.productiveTime === opt.id
                      ? "bg-[#EEF2FF] dark:bg-[#5B5CE2]/15 border-[#5B5CE2]/30 ring-1 ring-[#5B5CE2]/20"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <span className="text-xl block mb-1.5">{opt.icon}</span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{opt.label}</p>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {SESSION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setData({ ...data, sessionLength: opt })}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    data.sessionLength === opt
                      ? "bg-[#EEF2FF] dark:bg-[#5B5CE2]/15 border-[#5B5CE2]/30 text-[#5B5CE2] dark:text-[#797BF2] ring-1 ring-[#5B5CE2]/20"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {BREAK_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setData({ ...data, breakLength: opt })}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    data.breakLength === opt
                      ? "bg-[#EEF2FF] dark:bg-[#5B5CE2]/15 border-[#5B5CE2]/30 text-[#5B5CE2] dark:text-[#797BF2] ring-1 ring-[#5B5CE2]/20"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="text-center pt-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] dark:bg-[#5B5CE2]/15 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🚀</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Your planning profile is ready!</p>
              <div className="inline-flex flex-col gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                <span>📅 Working {data.workStart} – {data.workEnd}</span>
                <span>🎯 Peak: {data.productiveTime}</span>
                <span>⏱️ {data.sessionLength} sessions with {data.breakLength} breaks</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="h-8 px-3 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {step === 0 ? "Skip" : "Back"}
          </button>
          <button
            onClick={() => isLastStep ? handleFinish() : setStep(step + 1)}
            disabled={saving}
            className="h-8 px-4 rounded-lg text-xs font-medium text-white bg-[#5B5CE2] hover:bg-[#4F46E5] disabled:opacity-50 transition-colors shadow-xs flex items-center gap-1.5"
          >
            {saving ? (
              <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : isLastStep ? (
              "Generate My Schedule"
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
