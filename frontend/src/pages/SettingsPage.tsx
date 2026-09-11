import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Clock,
  Calendar,
  Sparkles,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Cpu,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../services/api";
import { Availability, UserPreference } from "../types";
import { Skeleton } from "../components/ui/Skeleton";
import { PlanningProfileCard } from "../components/PlanningProfileCard";
import { OnboardingWizard } from "../components/OnboardingWizard";

export const SettingsPage: React.FC = () => {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Preference fields
  const [focusTime, setFocusTime] = useState("Morning");
  const [maxDailyHours, setMaxDailyHours] = useState("6.0");
  const [defaultBreak, setDefaultBreak] = useState("15");

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [avails, prefs] = await Promise.all([
        api.availability.getAll(),
        api.preferences.getAll(),
      ]);
      setAvailabilities(avails);
      setPreferences(prefs);

      // Populate pref fields
      const prefMap: Record<string, string> = {};
      prefs.forEach((p) => {
        prefMap[p.key] = p.value;
      });

      if (prefMap["preferred_focus_time"]) setFocusTime(prefMap["preferred_focus_time"]);
      if (prefMap["max_daily_work_hours"]) setMaxDailyHours(prefMap["max_daily_work_hours"]);
      if (prefMap["default_break_minutes"]) setDefaultBreak(prefMap["default_break_minutes"]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAvailability = async (dayIndex: number) => {
    try {
      const newAvail = await api.availability.create({
        day_of_week: dayIndex,
        start_time: "09:00",
        end_time: "17:00",
      });
      setAvailabilities((prev) => [...prev, newAvail]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteAvailability = async (id: number) => {
    try {
      await api.availability.delete(id);
      setAvailabilities((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateAvailability = async (id: number, field: "start_time" | "end_time", value: string) => {
    setAvailabilities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
    try {
      await api.availability.update(id, { [field]: value });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        api.preferences.update("preferred_focus_time", focusTime),
        api.preferences.update("max_daily_work_hours", maxDailyHours),
        api.preferences.update("default_break_minutes", defaultBreak),
      ]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="space-y-6 max-w-4xl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 dark:text-white">
            Parameters & Constraints
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Weekly hard availability windows, circadian energy biases, and solver configuration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Preferences saved</span>
            </div>
          )}
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="h-8 px-3 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5B5CE2]" />
            <span>Setup Wizard</span>
          </button>
        </div>
      </div>

      {/* Adaptive Planning Profile Card */}
      <PlanningProfileCard />

      {/* Section 1: Weekly Availability Windows (Hard Constraints) */}
      <div className="p-5 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#5B5CE2]" />
              <span>Weekly Availability Windows</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Hard boundary limits. The optimizer strictly avoids scheduling tasks outside these working windows.
            </p>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 text-[#5B5CE2] dark:bg-indigo-950/40 dark:text-indigo-300">
            Hard Constraint
          </span>
        </div>

        <div className="space-y-2">
          {daysOfWeek.map((dayName, dayIdx) => {
            const daySlots = availabilities.filter((a) => a.day_of_week === dayIdx);

            return (
              <div
                key={dayName}
                className="p-2.5 rounded-lg bg-[#F5F6F8] dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="w-24 font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {dayName}
                </div>

                <div className="flex-1 flex flex-wrap items-center gap-2">
                  {daySlots.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No working hours configured</span>
                  ) : (
                    daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs"
                      >
                        <input
                          type="time"
                          value={slot.start_time}
                          onChange={(e) =>
                            handleUpdateAvailability(slot.id, "start_time", e.target.value)
                          }
                          aria-label={`${dayName} start time`}
                          className="bg-transparent text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none w-16"
                        />
                        <span className="text-slate-400 text-xs">–</span>
                        <input
                          type="time"
                          value={slot.end_time}
                          onChange={(e) =>
                            handleUpdateAvailability(slot.id, "end_time", e.target.value)
                          }
                          aria-label={`${dayName} end time`}
                          className="bg-transparent text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none w-16"
                        />
                        <button
                          onClick={() => handleDeleteAvailability(slot.id)}
                          aria-label="Remove availability slot"
                          className="text-slate-400 hover:text-rose-600 p-0.5 ml-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}

                  <button
                    onClick={() => handleAddAvailability(dayIdx)}
                    className="h-7 px-2 rounded-md bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-[#5B5CE2] text-xs flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs"
                    title={`Add window for ${dayName}`}
                  >
                    <Plus className="w-3 h-3" />
                    <span className="text-[11px] font-medium">Add Window</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Scheduling & Workload Biases (Soft Constraints) */}
      <div className="p-5 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#5B5CE2]" />
              <span>Circadian Rhythm & Workload Biases</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Soft scoring weights utilized by the constraint optimizer to rank candidate timetable slots.
            </p>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            Soft Weight
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Preferred Focus Period
            </label>
            <select
              value={focusTime}
              onChange={(e) => setFocusTime(e.target.value)}
              className="w-full h-8 px-2.5 bg-[#F5F6F8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#5B5CE2]"
            >
              <option value="Morning">Morning (08:00 – 12:00)</option>
              <option value="Afternoon">Afternoon (13:00 – 17:00)</option>
              <option value="Evening">Evening (18:00 – 22:00)</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">High-priority tasks prefer this window.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Max Daily Work (hrs)
            </label>
            <input
              type="number"
              min="2"
              max="12"
              step="0.5"
              value={maxDailyHours}
              onChange={(e) => setMaxDailyHours(e.target.value)}
              className="w-full h-8 px-2.5 bg-[#F5F6F8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#5B5CE2]"
            />
            <p className="text-[10px] text-slate-400 mt-1">Prevents cognitive fatigue.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Default Inter-Task Buffer (mins)
            </label>
            <input
              type="number"
              min="5"
              max="60"
              step="5"
              value={defaultBreak}
              onChange={(e) => setDefaultBreak(e.target.value)}
              className="w-full h-8 px-2.5 bg-[#F5F6F8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#5B5CE2]"
            />
            <p className="text-[10px] text-slate-400 mt-1">Mandatory buffer between tasks.</p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="h-8 px-3.5 rounded-lg text-xs font-medium text-white bg-[#5B5CE2] hover:bg-[#4F46E5] flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save Parameters"}</span>
          </button>
        </div>
      </div>

      {/* Section 3: AI Engine Provider Abstraction */}
      <div className="p-5 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-3">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#5B5CE2]" />
              <span>AI Engine Architecture</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Deterministic constraint satisfaction layer with human-in-the-loop audit logging.
            </p>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            Offline Deterministic
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-[#F5F6F8] dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-2.5 text-xs">
          <ShieldCheck className="w-4 h-4 text-[#5B5CE2] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-900 dark:text-white block">
              Active Mode: Explainable Deterministic Optimization
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              Generates conflict-free timetable proposals using temporal backtracking, circadian affinity matrices, and explainability reasoning trees. All human decisions are recorded in the feedback loop to improve future suggestions.
            </p>
          </div>
        </div>
      </div>

      {/* Onboarding Wizard Modal */}
      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onComplete={() => {
          setIsOnboardingOpen(false);
          loadSettings();
        }}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </motion.div>
  );
};
