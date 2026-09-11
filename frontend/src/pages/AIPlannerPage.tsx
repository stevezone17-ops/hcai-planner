import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Play,
  Check,
  Edit3,
  X,
  Lock,
  Unlock,
  AlertTriangle,
  Sliders,
  Clock,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import { ScheduleItem, UnscheduledTask } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { HITLBadge } from "../components/HITLBadge";
import { RejectionModal } from "../components/RejectionModal";
import { CapacityWarningBanner } from "../components/CapacityWarningBanner";

export const AIPlannerPage: React.FC<{ onNavigateTimetable?: () => void }> = ({
  onNavigateTimetable,
}) => {
  // Configuration options
  const [strategy, setStrategy] = useState<"balanced" | "urgent_first" | "focus_first">("balanced");
  const [maxWorkHours, setMaxWorkHours] = useState(6.0);
  const [focusSession, setFocusSession] = useState(60);
  const [minBreak, setMinBreak] = useState(15);
  const [daysToPlan, setDaysToPlan] = useState(3);

  // Generation sequence states
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const generationSteps = [
    "Analyzing tasks and deadlines...",
    "Checking availability windows...",
    "Applying hard constraints & locking rules...",
    "Balancing workload and break buffers...",
    "Optimizing schedule with soft scores...",
    "Preparing recommendations & AI explanations..."
  ];

  // Proposal Results
  const [proposedItems, setProposedItems] = useState<ScheduleItem[]>([]);
  const [unscheduledTasks, setUnscheduledTasks] = useState<UnscheduledTask[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Modals & interaction
  const [modifyingItem, setModifyingItem] = useState<ScheduleItem | null>(null);
  const [modifyStartTime, setModifyStartTime] = useState("");
  const [rejectingItem, setRejectingItem] = useState<ScheduleItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionToast, setActionToast] = useState<string | null>(null);

  useEffect(() => {
    loadExistingProposals();
  }, []);

  const loadExistingProposals = async () => {
    try {
      const items = await api.schedule.getAll({ include_rejected: false });
      const proposals = items.filter((i) => i.status === "PROPOSED");
      if (proposals.length > 0) {
        setProposedItems(proposals);
        setHasGenerated(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCurrentStepIndex(0);
    setActionToast(null);

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < generationSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 280);

    try {
      const response = await api.planner.generate({
        strategy,
        max_work_hours_per_day: maxWorkHours,
        focus_session_minutes: focusSession,
        min_break_minutes: minBreak,
        days_to_plan: daysToPlan,
      });

      setTimeout(() => {
        clearInterval(stepInterval);
        setIsGenerating(false);
        setProposedItems(response.proposed_items);
        setUnscheduledTasks(response.unscheduled_tasks);
        setHasGenerated(true);
      }, 1800);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsGenerating(false);
      alert(err.message || "Failed to generate schedule");
    }
  };

  // Human Actions
  const handleApprove = async (id: number) => {
    try {
      const res = await api.schedule.approve(id);
      setProposedItems((prev) => prev.map((item) => (item.id === id ? res.item : item)));
      showToast("Proposal accepted and confirmed into your timetable.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRejectModalSubmit = async (reason: string, comment?: string) => {
    if (!rejectingItem) return;
    try {
      const fullReason = comment ? `${reason}: ${comment}` : reason;
      await api.schedule.reject(rejectingItem.id, fullReason);
      setProposedItems((prev) => prev.filter((item) => item.id !== rejectingItem.id));
      setRejectingItem(null);
      showToast("Suggestion rejected; preference recorded.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleModify = async () => {
    if (!modifyingItem || !modifyStartTime) return;
    try {
      const res = await api.schedule.modify(modifyingItem.id, {
        start_time: new Date(modifyStartTime).toISOString(),
        reason: "User adjusted timing in AI Planner",
      });
      setProposedItems((prev) => prev.map((item) => (item.id === modifyingItem.id ? res.item : item)));
      setModifyingItem(null);
      setModifyStartTime("");
      showToast("Timing updated! Tagged as 'Modified by You'.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleLock = async (item: ScheduleItem) => {
    try {
      const res = item.locked ? await api.schedule.unlock(item.id) : await api.schedule.lock(item.id);
      setProposedItems((prev) => prev.map((it) => (it.id === item.id ? res.item : it)));
      showToast(item.locked ? "Item unlocked." : "Item locked as an immovable hard constraint!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApproveAll = async () => {
    const unapproved = proposedItems.filter((i) => i.status === "PROPOSED");
    for (const it of unapproved) {
      try {
        await api.schedule.approve(it.id);
      } catch (e) {
        console.error(e);
      }
    }
    await loadExistingProposals();
    showToast("All proposed tasks approved!");
  };

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-lg shadow-elevated flex items-center gap-2 text-xs font-medium backdrop-blur-md animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
            AI Planner
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build an optimal timetable around your real constraints and energy rhythms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="h-8 px-3.5 rounded-lg text-xs font-medium text-white bg-[#5B5CE2] hover:bg-[#4F46E5] disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? "Synthesizing..." : "Generate AI Timetable"}</span>
          </button>
        </div>
      </div>

      {/* Planning Controls Bar */}
      <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#5B5CE2]" />
            <span>Planning Controls & Boundaries</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">100% Deterministic Guarantee</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Workload */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Target Daily Workload
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="2"
                max="10"
                step="0.5"
                value={maxWorkHours}
                onChange={(e) => setMaxWorkHours(Number(e.target.value))}
                className="flex-1 accent-[#5B5CE2]"
              />
              <span className="text-xs font-mono font-bold text-[#5B5CE2] w-8 text-right">
                {maxWorkHours}h
              </span>
            </div>
          </div>

          {/* Session Size */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Focus Session
            </label>
            <select
              value={focusSession}
              onChange={(e) => setFocusSession(Number(e.target.value))}
              className="w-full h-8 px-2.5 bg-[#F5F6F8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5B5CE2]"
            >
              <option value={45}>45 min (Sprint)</option>
              <option value={60}>60 min (Standard)</option>
              <option value={90}>90 min (Deep Work)</option>
              <option value={120}>120 min (Intensive)</option>
            </select>
          </div>

          {/* Break Buffer */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Inter-Task Break
            </label>
            <select
              value={minBreak}
              onChange={(e) => setMinBreak(Number(e.target.value))}
              className="w-full h-8 px-2.5 bg-[#F5F6F8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5B5CE2]"
            >
              <option value={10}>10 min</option>
              <option value={15}>15 min (Standard)</option>
              <option value={20}>20 min</option>
              <option value={30}>30 min</option>
            </select>
          </div>

          {/* Strategy */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Priority Strategy
            </label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as any)}
              className="w-full h-8 px-2.5 bg-[#F5F6F8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5B5CE2]"
            >
              <option value="balanced">Balanced Pacing</option>
              <option value="urgent_first">Urgent Deadlines First</option>
              <option value="focus_first">Deep Focus Clustering</option>
            </select>
          </div>

          {/* Horizon */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Planning Horizon
            </label>
            <select
              value={daysToPlan}
              onChange={(e) => setDaysToPlan(Number(e.target.value))}
              className="w-full h-8 px-2.5 bg-[#F5F6F8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5B5CE2]"
            >
              <option value={1}>Today (1 Day)</option>
              <option value={3}>Next 3 Days</option>
              <option value={7}>Full Week (7 Days)</option>
            </select>
          </div>
        </div>

        {/* Generation Progress Sequence */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#5B5CE2] animate-pulse" />
                  Synthesizing optimal timetable proposal...
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  {Math.round(((currentStepIndex + 1) / generationSteps.length) * 100)}%
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                <motion.div
                  className="bg-[#5B5CE2] h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentStepIndex + 1) / generationSteps.length) * 100}%`,
                  }}
                  transition={{ duration: 0.2 }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                {generationSteps.map((step, idx) => {
                  const isDone = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div
                      key={step}
                      className={`flex items-center gap-1.5 ${
                        isDone
                          ? "text-emerald-600 dark:text-emerald-400 font-medium"
                          : isCurrent
                          ? "text-[#5B5CE2] font-semibold"
                          : "text-slate-400"
                      }`}
                    >
                      <span>{isDone ? "✓" : isCurrent ? "●" : "○"}</span>
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Proposal Results Section */}
      {hasGenerated && !isGenerating && (
        <div className="space-y-4">
          {/* Over-Capacity Banner */}
          <CapacityWarningBanner
            scheduleItems={proposedItems}
            maxDailyMinutes={maxWorkHours * 60}
            onResolve={(action) => showToast(`Adaptive adjustment: ${action}`)}
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>AI Proposed Timetable Slots</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#5B5CE2] font-semibold">
                  {proposedItems.length} Proposals
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparent reasoning for each placement. Accept, modify, lock, or reject.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleApproveAll}
                className="h-7 px-2.5 rounded-md text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Accept All</span>
              </button>
              {onNavigateTimetable && (
                <button
                  onClick={onNavigateTimetable}
                  className="h-7 px-2.5 rounded-md text-xs font-medium text-[#5B5CE2] hover:bg-[#EEF2FF] border border-[#C7D2FE] transition-colors flex items-center gap-1"
                >
                  <span>View Timetable</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Proposals Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {proposedItems.map((item) => {
              const sTime = new Date(item.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              const eTime = new Date(item.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              const dateStr = new Date(item.start_time).toLocaleDateString([], {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              const isApproved = item.status === "ACCEPTED" || item.approved;
              const isModified = item.status === "MODIFIED";

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border bg-white dark:bg-[#161B22] shadow-xs space-y-3 transition-colors ${
                    item.locked
                      ? "border-blue-300 dark:border-blue-800/80"
                      : isModified
                      ? "border-amber-300 dark:border-amber-800/80"
                      : isApproved
                      ? "border-emerald-300 dark:border-emerald-800/80"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {/* Top Bar: Badges & Confidence */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <HITLBadge
                        status={item.status}
                        source={item.source}
                        locked={item.locked}
                        originalStart={item.original_start}
                        currentStart={item.start_time}
                      />
                      {item.task && <PriorityBadge priority={item.task.priority} />}
                      {item.task && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-medium">
                          {item.task.category}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Confidence: <strong className="text-[#5B5CE2] font-semibold">{Math.round(item.confidence * 100)}%</strong>
                    </span>
                  </div>

                  {/* Task Title & When */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                      {item.task?.title || "Scheduled Task"}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {dateStr}
                      </span>
                      <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-mono font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#5B5CE2]" />
                        {sTime} – {eTime} ({item.task?.duration_minutes}m)
                      </span>
                    </div>
                  </div>

                  {/* Transparent Why this time? */}
                  <div className="p-2.5 rounded-lg bg-[#F5F6F8] dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-0.5">
                    <span className="font-semibold text-xs text-[#5B5CE2] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Why this time?
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      {item.ai_reason || "Scheduled in your optimal focus period before deadline."}
                    </p>
                  </div>

                  {/* HITL Action Controls */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleApprove(item.id)}
                        disabled={isApproved}
                        className={`h-7 px-2.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                          isApproved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                            : "bg-[#5B5CE2] hover:bg-[#4F46E5] text-white"
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>{isApproved ? "Accepted" : "Accept"}</span>
                      </button>

                      <button
                        onClick={() => {
                          setModifyingItem(item);
                          setModifyStartTime(item.start_time.slice(0, 16));
                        }}
                        className="h-7 px-2.5 rounded-md text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3 text-amber-600" />
                        <span>Modify</span>
                      </button>

                      <button
                        onClick={() => setRejectingItem(item)}
                        className="h-7 px-2 rounded-md text-xs font-medium text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        <span>Reject</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleToggleLock(item)}
                      className={`h-7 px-2.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                        item.locked
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {item.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 text-slate-400" />}
                      <span>{item.locked ? "Locked" : "Lock"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unscheduled Tasks Section */}
      {hasGenerated && unscheduledTasks.length > 0 && !isGenerating && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-950/20 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>Unscheduled Tasks ({unscheduledTasks.length}) — Constraint Diagnostics</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            The following tasks could not be placed without violating hard boundaries:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {unscheduledTasks.map((t) => (
              <div key={t.task_id} className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/40 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white">{t.title}</h4>
                  <PriorityBadge priority={t.priority as any} />
                </div>
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  <strong>Conflict: </strong>{t.reason}
                </p>
                <p className="text-xs text-[#5B5CE2] dark:text-indigo-400">
                  <strong>Suggested: </strong>{t.suggested_action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modify Modal */}
      {modifyingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-elevated">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-600" />
                <span>Adjust Scheduled Timing</span>
              </h3>
              <button onClick={() => setModifyingItem(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Task: <strong className="text-slate-900 dark:text-white">{modifyingItem.task?.title}</strong>
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                New Start Time
              </label>
              <input
                type="datetime-local"
                value={modifyStartTime}
                onChange={(e) => setModifyStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5B5CE2]"
              />
            </div>

            <p className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/40">
              Moving this task marks it as <strong>"Modified by You"</strong> and updates your learned preferences.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModifyingItem(null)}
                className="h-8 px-3 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleModify}
                className="h-8 px-3 rounded-lg text-xs font-medium text-white bg-[#5B5CE2] hover:bg-[#4F46E5]"
              >
                Confirm Modification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal with Categorized Reasons */}
      <RejectionModal
        isOpen={!!rejectingItem}
        taskTitle={rejectingItem?.task?.title || "Proposed Slot"}
        onReject={handleRejectModalSubmit}
        onClose={() => setRejectingItem(null)}
      />
    </div>
  );
};
