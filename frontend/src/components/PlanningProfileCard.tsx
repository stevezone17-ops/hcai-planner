import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import type { UserPreference } from "../types";

interface ProfileEntry {
  label: string;
  value: string;
  icon: string;
  confidence?: number;
  source?: string;
}

export function PlanningProfileCard() {
  const [entries, setEntries] = useState<ProfileEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const prefs = await api.preferences.getAll();
      const map = new Map<string, UserPreference>();
      prefs.forEach((p) => map.set(p.key, p));

      const profile: ProfileEntry[] = [
        {
          label: "Peak Focus",
          value: map.get("preferred_focus_time")?.value || "09:00 – 12:00",
          icon: "🎯",
          confidence: map.get("preferred_focus_time")?.confidence || 0.7,
          source: map.get("preferred_focus_time")?.source || "DEFAULT",
        },
        {
          label: "Preferred Session",
          value: `${map.get("preferred_session_minutes")?.value || "60"} minutes`,
          icon: "⏱️",
          confidence: map.get("preferred_session_minutes")?.confidence || 0.7,
          source: map.get("preferred_session_minutes")?.source || "DEFAULT",
        },
        {
          label: "Preferred Break",
          value: `${map.get("min_break_minutes")?.value || "15"} minutes`,
          icon: "☕",
          confidence: map.get("min_break_minutes")?.confidence || 0.7,
          source: map.get("min_break_minutes")?.source || "DEFAULT",
        },
        {
          label: "Technical Tasks",
          value: map.get("category_time_Coding")?.value ? "Evening" : "Morning",
          icon: "💻",
          confidence: map.get("category_time_Coding")?.confidence || 0.6,
          source: map.get("category_time_Coding")?.source || "DEFAULT",
        },
        {
          label: "Creative Tasks",
          value: "Afternoon",
          icon: "🎨",
          confidence: 0.65,
          source: "DEFAULT",
        },
        {
          label: "Max Daily Workload",
          value: `${map.get("max_work_hours_per_day")?.value || "8"} hours`,
          icon: "📊",
          confidence: map.get("max_work_hours_per_day")?.confidence || 0.8,
          source: map.get("max_work_hours_per_day")?.source || "DEFAULT",
        },
      ];

      setEntries(profile);
    } catch {
      // Use defaults
      setEntries([
        { label: "Peak Focus", value: "09:00 – 12:00", icon: "🎯" },
        { label: "Preferred Session", value: "60 minutes", icon: "⏱️" },
        { label: "Preferred Break", value: "15 minutes", icon: "☕" },
        { label: "Technical Tasks", value: "Morning", icon: "💻" },
        { label: "Creative Tasks", value: "Afternoon", icon: "🎨" },
        { label: "Max Daily Workload", value: "8 hours", icon: "📊" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="surface-card rounded-xl p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-56 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] dark:bg-[#5B5CE2]/15 flex items-center justify-center">
            <span className="text-sm">🧠</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Your Planning Profile</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Learned from your interactions</p>
          </div>
        </div>
        <span className="badge-ai text-[10px] px-2 py-0.5 rounded-full font-medium">Adaptive</span>
      </div>

      {/* Profile Grid */}
      <div className="grid grid-cols-2 gap-2">
        {entries.map((entry, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
          >
            <span className="text-sm shrink-0">{entry.icon}</span>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide font-medium">{entry.label}</p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{entry.value}</p>
            </div>
            {entry.confidence && entry.source === "LEARNED" && (
              <span className="ml-auto text-[9px] text-[#5B5CE2] dark:text-[#797BF2] font-bold shrink-0">{Math.round(entry.confidence * 100)}%</span>
            )}
          </div>
        ))}
      </div>

      {/* Transparency Note */}
      <div className="mt-3 px-3 py-2 rounded-lg bg-[#EEF2FF] dark:bg-[#5B5CE2]/10 border border-[#C7D2FE] dark:border-[#5B5CE2]/25">
        <p className="text-[10px] text-[#4338CA] dark:text-[#C7D2FE] leading-relaxed">
          <span className="font-semibold">Transparency:</span> Learned from your accept, modify, lock, and reject actions. You can override any preference manually.
        </p>
      </div>
    </div>
  );
}
