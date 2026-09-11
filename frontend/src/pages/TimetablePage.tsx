import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  RefreshCw,
  Clock,
  Sparkles,
  Calendar as CalendarIcon,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { api } from "../services/api";
import { ScheduleItem, ReplanDiffItem } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { CurrentTimeIndicator } from "../components/ui/CurrentTimeIndicator";
import { WhatIfModal } from "../components/WhatIfModal";
import { CapacityWarningBanner } from "../components/CapacityWarningBanner";

export const TimetablePage: React.FC = () => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [whatIfOpen, setWhatIfOpen] = useState(false);

  // Replan Modal state
  const [replanModalOpen, setReplanModalOpen] = useState(false);
  const [unavailStartTime, setUnavailStartTime] = useState("14:00");
  const [unavailEndTime, setUnavailEndTime] = useState("17:00");
  const [replanReason, setReplanReason] = useState("Unscheduled lab seminar 14:00 - 17:00");
  const [replanLoading, setReplanLoading] = useState(false);
  const [replanDiffs, setReplanDiffs] = useState<ReplanDiffItem[] | null>(null);
  const [replanMessage, setReplanMessage] = useState<string | null>(null);

  // Drag & Drop tracking
  const [draggedItem, setDraggedItem] = useState<ScheduleItem | null>(null);
  const [dragOverHour, setDragOverHour] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const items = await api.schedule.getAll({ include_rejected: false });
      setScheduleItems(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleLock = async (item: ScheduleItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = item.locked ? await api.schedule.unlock(item.id) : await api.schedule.lock(item.id);
      setScheduleItems((prev) => prev.map((it) => (it.id === item.id ? res.item : it)));
      showToast(item.locked ? "Item unlocked." : "Item locked! Preserved as hard constraint.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Drag & Drop
  const handleDragStart = (item: ScheduleItem) => {
    if (item.locked) {
      showToast("Locked items cannot be moved! Unlock first to reposition.");
      return;
    }
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    setDragOverHour(hour);
  };

  const handleDragLeave = () => {
    setDragOverHour(null);
  };

  const handleDrop = async (e: React.DragEvent, targetHour: number, targetDayDate: Date) => {
    e.preventDefault();
    setDragOverHour(null);

    if (!draggedItem) return;
    if (draggedItem.locked) {
      showToast("Cannot move locked item.");
      setDraggedItem(null);
      return;
    }

    const origDuration =
      (new Date(draggedItem.end_time).getTime() - new Date(draggedItem.start_time).getTime()) /
      (1000 * 60);

    const newStart = new Date(targetDayDate);
    newStart.setHours(targetHour, 0, 0, 0);
    const newEnd = new Date(newStart.getTime() + origDuration * 60 * 1000);

    try {
      const res = await api.schedule.modify(draggedItem.id, {
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString(),
        reason: `User dragged task to ${targetHour}:00`,
      });

      setScheduleItems((prev) => prev.map((it) => (it.id === draggedItem.id ? res.item : it)));
      showToast(
        `Schedule updated! Tagged "Modified by You". (AI: ${new Date(
          draggedItem.start_time
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} → You: ${targetHour}:00)`
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDraggedItem(null);
    }
  };

  // Replanning
  const handleExecuteReplan = async () => {
    setReplanLoading(true);
    setReplanDiffs(null);
    try {
      const targetDateStr = currentDate.toISOString().split("T")[0];
      const unavailStart = new Date(`${targetDateStr}T${unavailStartTime}:00`).toISOString();
      const unavailEnd = new Date(`${targetDateStr}T${unavailEndTime}:00`).toISOString();

      const res = await api.planner.replan({
        start_date: new Date(`${targetDateStr}T08:00:00`).toISOString(),
        unavailability_start: unavailStart,
        unavailability_end: unavailEnd,
        reason: replanReason,
      });

      setReplanDiffs(res.moved_items);
      setReplanMessage(res.message);
      await loadSchedule();
    } catch (err: any) {
      alert(err.message || "Replanning failed");
    } finally {
      setReplanLoading(false);
    }
  };

  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 to 22:00

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const dayItems = scheduleItems.filter((item) => isSameDay(new Date(item.start_time), currentDate));

  // Week days if in week view
  const getWeekDates = (baseDate: Date) => {
    const startOfWeek = new Date(baseDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(currentDate);

  const getItemCardStyle = (item: ScheduleItem) => {
    if (item.locked) {
      return "bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-100";
    }
    if (item.status === "MODIFIED") {
      return "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100 hover:border-amber-400";
    }
    if (item.status === "ACCEPTED") {
      return "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 hover:border-emerald-400";
    }
    const cat = item.task?.category?.toLowerCase() || "";
    if (cat.includes("tech") || cat.includes("code") || cat.includes("dev")) {
      return "bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-100 hover:border-blue-400";
    }
    if (cat.includes("acad") || cat.includes("study") || cat.includes("research")) {
      return "bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-100 hover:border-indigo-400";
    }
    if (cat.includes("health") || cat.includes("sport") || cat.includes("fit")) {
      return "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100 hover:border-amber-400";
    }
    if (cat.includes("person") || cat.includes("life")) {
      return "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 hover:border-emerald-400";
    }
    return "bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-100 hover:border-indigo-400";
  };

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-lg shadow-elevated flex items-center gap-2 text-xs font-medium backdrop-blur-md animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
            Timetable
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Drag unlocked blocks to reschedule. Locked items stay strictly anchored during replanning.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Day / Week toggle */}
          <div className="flex items-center bg-white dark:bg-[#161B22] p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "day"
                  ? "bg-[#F5F6F8] dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === "week"
                  ? "bg-[#F5F6F8] dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Week
            </button>
          </div>

          <button
            onClick={() => setWhatIfOpen(true)}
            className="h-8 px-3 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 border border-amber-200 dark:border-amber-500/30 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>🔮 What-If</span>
          </button>

          <button
            onClick={() => setReplanModalOpen(true)}
            className="h-8 px-3 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            <span>Replan Tasks</span>
          </button>

          {/* Date Controls */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#161B22] p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              onClick={() => {
                const prev = new Date(currentDate);
                prev.setDate(prev.getDate() - (viewMode === "week" ? 7 : 1));
                setCurrentDate(prev);
              }}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 px-2 min-w-[105px] text-center font-mono">
              {currentDate.toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <button
              onClick={() => {
                const next = new Date(currentDate);
                next.setDate(next.getDate() + (viewMode === "week" ? 7 : 1));
                setCurrentDate(next);
              }}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Capacity Warning Banner */}
      <CapacityWarningBanner
        scheduleItems={scheduleItems}
        onResolve={(action) => showToast(`Schedule adjusted: ${action}`)}
      />

      {/* Semantic Legend Bar */}
      <div className="flex items-center gap-4 flex-wrap py-2 px-3 rounded-lg bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 shadow-xs">
        <span className="font-semibold text-slate-800 dark:text-slate-200">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#5B5CE2]" />
          <span>AI Suggested</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Accepted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Modified by You</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>🔒 Locked (Hard Constraint)</span>
        </div>
      </div>

      {/* Timetable Grid View */}
      {viewMode === "day" ? (
        <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
          {/* Live Current Time Indicator */}
          <CurrentTimeIndicator startHour={8} hourHeight={72} />

          {hours.map((hour) => {
            const matchingItems = dayItems.filter((item) => {
              const start = new Date(item.start_time);
              const end = new Date(item.end_time);
              const hourStart = new Date(currentDate);
              hourStart.setHours(hour, 0, 0, 0);
              const hourEnd = new Date(currentDate);
              hourEnd.setHours(hour + 1, 0, 0, 0);
              return maxDate(start, hourStart) < minDate(end, hourEnd);
            });

            const isOver = dragOverHour === hour;

            return (
              <div
                key={hour}
                onDragOver={(e) => handleDragOver(e, hour)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, hour, currentDate)}
                className={`min-h-[72px] flex items-stretch transition-colors duration-100 ${
                  isOver ? "bg-[#EEF2FF] dark:bg-[#5B5CE2]/10 ring-2 ring-inset ring-[#5B5CE2] rounded-md" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                }`}
              >
                {/* Time Axis Column */}
                <div className="w-20 p-3 border-r border-slate-200 dark:border-slate-800 shrink-0 text-xs font-mono text-slate-400">
                  <span>{`${hour.toString().padStart(2, "0")}:00`}</span>
                </div>

                {/* Event Area */}
                <div className="flex-1 p-2 flex flex-col sm:flex-row gap-2 relative">
                  {matchingItems.length === 0 && (
                    <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-400 select-none pointer-events-none">
                      {isOver ? "Drop to reschedule task here" : "Open slot"}
                    </div>
                  )}

                  {matchingItems.map((item) => {
                    const task = item.task;
                    const isStartingThisHour = new Date(item.start_time).getHours() === hour;
                    if (!isStartingThisHour) return null;

                    const durMinutes =
                      (new Date(item.end_time).getTime() - new Date(item.start_time).getTime()) /
                      (1000 * 60);

                    const sTime = new Date(item.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    const eTime = new Date(item.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                    return (
                      <div
                        key={item.id}
                        draggable={!item.locked}
                        onDragStart={() => handleDragStart(item)}
                        className={`flex-1 p-3 rounded-lg border transition-all select-none ${
                          item.locked ? "cursor-default" : "cursor-grab active:cursor-grabbing"
                        } ${getItemCardStyle(item)}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <StatusBadge status={item.status} locked={item.locked} />
                              {task && <PriorityBadge priority={task.priority} />}
                              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                {sTime} – {eTime} ({durMinutes}m)
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                              {task ? task.title : "Task"}
                            </h4>
                            {item.ai_reason && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                {item.ai_reason}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={(e) => handleToggleLock(item, e)}
                            title={item.locked ? "Unlock schedule item" : "Lock schedule item"}
                            className={`p-1 rounded-md text-xs font-medium transition-colors ${
                              item.locked
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {item.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Week View Grid */
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] overflow-x-auto shadow-xs">
          <div className="min-w-[760px]">
            {/* Week Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 text-center py-2.5 bg-[#FAFBFC] dark:bg-[#161B22] text-xs font-semibold text-slate-700 dark:text-slate-300">
              {weekDates.map((d) => (
                <div key={d.toISOString()} className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase block">
                    {d.toLocaleDateString([], { weekday: "short" })}
                  </span>
                  <span className={`font-semibold ${isSameDay(d, new Date()) ? "text-[#5B5CE2] font-bold" : "text-slate-800 dark:text-white"}`}>
                    {d.toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>

            {/* Week items columns */}
            <div className="grid grid-cols-7 divide-x divide-slate-200 dark:divide-slate-800 min-h-[360px] p-2">
              {weekDates.map((dayDate) => {
                const itemsThisDay = scheduleItems.filter((it) => isSameDay(new Date(it.start_time), dayDate));

                return (
                  <div key={dayDate.toISOString()} className="p-1.5 space-y-1.5">
                    {itemsThisDay.length === 0 ? (
                      <span className="text-[10px] text-slate-400 block text-center pt-6">No tasks</span>
                    ) : (
                      itemsThisDay.map((item) => (
                        <div
                          key={item.id}
                          className={`p-2 rounded-lg border text-xs space-y-0.5 ${getItemCardStyle(item)}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                              {new Date(item.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {item.locked && <Lock className="w-3 h-3 text-blue-600" />}
                          </div>
                          <p className="font-semibold text-slate-900 dark:text-white truncate">{item.task?.title || "Task"}</p>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Replan Modal Dialog */}
      {replanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-lg p-5 space-y-4 shadow-elevated">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-600" />
                <span>Adaptive Schedule Replanner</span>
              </h3>
              <button
                onClick={() => {
                  setReplanModalOpen(false);
                  setReplanDiffs(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Declare an unexpected conflict. The replanner will <strong>strictly preserve all locked tasks</strong>, relocate affected items, and produce an audit diff.
            </p>

            <div className="p-3.5 rounded-lg bg-[#F5F6F8] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                Newly Unavailable Period (Today)
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">From</span>
                  <input
                    type="time"
                    value={unavailStartTime}
                    onChange={(e) => setUnavailStartTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5B5CE2]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">To</span>
                  <input
                    type="time"
                    value={unavailEndTime}
                    onChange={(e) => setUnavailEndTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5B5CE2]"
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Reason / Context</span>
                <input
                  type="text"
                  value={replanReason}
                  onChange={(e) => setReplanReason(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5B5CE2]"
                />
              </div>
            </div>

            {/* Replan Results Diff */}
            {replanDiffs && (
              <div className="p-3.5 rounded-lg bg-[#EEF2FF] dark:bg-[#5B5CE2]/10 border border-[#C7D2FE] dark:border-[#5B5CE2]/30 space-y-2">
                <div className="text-xs font-semibold text-[#5B5CE2] flex items-center justify-between">
                  <span>Replanning Results Diff</span>
                  <span>{replanDiffs.length} Displaced Tasks Moved</span>
                </div>
                {replanMessage && <p className="text-[11px] text-slate-600 dark:text-slate-300">{replanMessage}</p>}

                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                  {replanDiffs.map((diff) => (
                    <div
                      key={diff.task_id}
                      className="p-2 rounded-md bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 text-xs space-y-0.5"
                    >
                      <div className="font-semibold text-slate-900 dark:text-white">{diff.task_title}</div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="line-through text-rose-500 font-mono">
                          {new Date(diff.previous_start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {new Date(diff.new_start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">{diff.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  setReplanModalOpen(false);
                  setReplanDiffs(null);
                }}
                className="h-8 px-3 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200"
              >
                Close
              </button>
              <button
                onClick={handleExecuteReplan}
                disabled={replanLoading}
                className="h-8 px-3 rounded-lg text-xs font-medium text-white bg-[#5B5CE2] hover:bg-[#4F46E5] flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${replanLoading ? "animate-spin" : ""}`} />
                <span>Execute Replan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* What-If Simulation Sandbox Modal */}
      <WhatIfModal
        isOpen={whatIfOpen}
        onClose={() => setWhatIfOpen(false)}
        currentSchedule={scheduleItems}
        onApply={(simulated) => {
          setScheduleItems(simulated);
          showToast("Simulation plan applied to your current schedule view!");
        }}
      />
    </div>
  );
};

function minDate(d1: Date, d2: Date): Date {
  return d1 < d2 ? d1 : d2;
}

function maxDate(d1: Date, d2: Date): Date {
  return d1 > d2 ? d1 : d2;
}
