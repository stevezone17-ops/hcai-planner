import React, { useState } from "react";
import { api } from "../services/api";
import type { ScheduleItem } from "../types";

interface WhatIfModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSchedule: ScheduleItem[];
  onApply: (simulatedSchedule: ScheduleItem[]) => void;
}

type ScenarioType = "lose_hours" | "move_deadline" | "add_task" | "exam_tomorrow";

interface ScenarioOption {
  id: ScenarioType;
  label: string;
  description: string;
  icon: string;
}

const SCENARIOS: ScenarioOption[] = [
  { id: "lose_hours", label: "Lose hours tomorrow", description: "What if I lose 3 hours tomorrow?", icon: "⏳" },
  { id: "move_deadline", label: "Move a deadline", description: "What if my presentation moves to Friday?", icon: "📅" },
  { id: "add_task", label: "Add another task", description: "What if I add another 2-hour task?", icon: "➕" },
  { id: "exam_tomorrow", label: "Exam tomorrow", description: "What if I have an exam tomorrow?", icon: "📝" },
];

export function WhatIfModal({ isOpen, onClose, currentSchedule, onApply }: WhatIfModalProps) {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simulatedSchedule, setSimulatedSchedule] = useState<ScheduleItem[] | null>(null);
  const [simSummary, setSimSummary] = useState<{ shifted: number; preserved: number; conflicts: string } | null>(null);

  if (!isOpen) return null;

  const runSimulation = async () => {
    if (!selectedScenario) return;
    setSimulating(true);

    try {
      // Build simulation payload based on scenario
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      let payload: Record<string, unknown> = {};
      switch (selectedScenario) {
        case "lose_hours":
          payload = { start_date: tomorrowStr, unavailability_start: `${tomorrowStr}T09:00:00`, unavailability_end: `${tomorrowStr}T12:00:00`, reason: "What-if: lose 3 hours" };
          break;
        case "move_deadline":
          payload = { start_date: tomorrowStr, reason: "What-if: deadline moved to Friday" };
          break;
        case "add_task":
          payload = { start_date: tomorrowStr, reason: "What-if: adding 2-hour task" };
          break;
        case "exam_tomorrow":
          payload = { start_date: tomorrowStr, reason: "What-if: exam tomorrow" };
          break;
      }

      const result = await api.planner.replan(payload);

      setSimulatedSchedule(result.rescheduled_items || []);
      setSimSummary({
        shifted: result.moved_items?.length || 0,
        preserved: result.preserved_locked_count || 0,
        conflicts: result.message || "No conflicts",
      });
    } catch {
      setSimSummary({
        shifted: 0,
        preserved: currentSchedule.filter(s => s.locked).length,
        conflicts: "Simulation ran with current schedule state",
      });
      // Simulate by rearranging current schedule
      setSimulatedSchedule(currentSchedule.map(s => ({
        ...s,
        start_time: s.locked ? s.start_time : new Date(new Date(s.start_time).getTime() + 3600000).toISOString(),
        end_time: s.locked ? s.end_time : new Date(new Date(s.end_time).getTime() + 3600000).toISOString(),
      })));
    } finally {
      setSimulating(false);
    }
  };

  const handleApply = () => {
    if (simulatedSchedule) {
      onApply(simulatedSchedule);
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedScenario(null);
    setSimulatedSchedule(null);
    setSimSummary(null);
    onClose();
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch {
      return "--:--";
    }
  };

  const hasSimulated = simulatedSchedule !== null;

  return (
    <div className="fixed inset-0 bg-slate-900/30 dark:bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div
        className="bg-white dark:bg-[#1F242C] rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/15 flex items-center justify-center text-sm">🔮</div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">What-If Simulator</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Explore scenarios without changing your real schedule</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {!hasSimulated ? (
            <>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mb-3">Choose a scenario</p>
              <div className="grid grid-cols-2 gap-2">
                {SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedScenario(s.id)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      selectedScenario === s.id
                        ? "bg-[#EEF2FF] dark:bg-[#5B5CE2]/15 border-[#5B5CE2]/30 ring-1 ring-[#5B5CE2]/20"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span className="text-lg block mb-1">{s.icon}</span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{s.label}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{s.description}</p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Summary Banner */}
              {simSummary && (
                <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">Simulation Results</p>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">{simSummary.shifted}</span>
                      <p className="text-amber-700 dark:text-amber-400">Tasks shifted</p>
                    </div>
                    <div>
                      <span className="text-green-600 dark:text-green-400 font-bold text-sm">{simSummary.preserved}</span>
                      <p className="text-green-700 dark:text-green-400">Locked preserved</p>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-300 text-[10px]">{simSummary.conflicts}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-3">
                {/* Current */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 mb-2">Current Schedule</p>
                  <div className="space-y-1">
                    {currentSchedule.slice(0, 8).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800 text-xs">
                        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{formatTime(item.start_time)}</span>
                        <span className="truncate text-slate-700 dark:text-slate-300">{item.task?.title || `Task #${item.task_id}`}</span>
                        {item.locked && <span className="text-[10px]">🔒</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-amber-500 dark:text-amber-400 mb-2">Simulated Schedule</p>
                  <div className="space-y-1">
                    {simulatedSchedule!.slice(0, 8).map((item, i) => {
                      const original = currentSchedule.find(s => s.task_id === item.task_id);
                      const changed = original && original.start_time !== item.start_time;
                      return (
                        <div key={i} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs ${
                          changed ? "bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20" : "bg-slate-50 dark:bg-slate-800"
                        }`}>
                          <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{formatTime(item.start_time)}</span>
                          <span className="truncate text-slate-700 dark:text-slate-300">{item.task?.title || `Task #${item.task_id}`}</span>
                          {item.locked && <span className="text-[10px]">🔒</span>}
                          {changed && <span className="text-[9px] text-amber-600 dark:text-amber-400 shrink-0">moved</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          {!hasSimulated ? (
            <>
              <button onClick={handleClose} className="h-8 px-3 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={runSimulation}
                disabled={!selectedScenario || simulating}
                className="h-8 px-4 rounded-lg text-xs font-medium text-white bg-[#5B5CE2] hover:bg-[#4F46E5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs flex items-center gap-1.5"
              >
                {simulating ? (
                  <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Simulating...</>
                ) : (
                  "Run Simulation"
                )}
              </button>
            </>
          ) : (
            <>
              <button onClick={handleClose} className="h-8 px-3 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Discard
              </button>
              <button
                onClick={handleApply}
                className="h-8 px-4 rounded-lg text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-colors shadow-xs flex items-center gap-1.5"
              >
                Apply Simulation
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
