import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../services/api";
import { ScheduleItem } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { EmptyState } from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";

export const CalendarPage: React.FC = () => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

  // Calendar month math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon...
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Items on selected day
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const selectedDayItems = scheduleItems.filter((it) =>
    isSameDay(new Date(it.start_time), selectedDay)
  );

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 dark:text-white">
            Monthly Horizon
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Month-level deadline proximity, multi-day workload density, and scheduled blocks.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-[#161B22] p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              onClick={prevMonth}
              aria-label="Previous month"
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 px-2.5 min-w-[120px] text-center font-mono">
              {currentDate.toLocaleDateString([], { month: "long", year: "numeric" })}
            </span>
            <button
              onClick={nextMonth}
              aria-label="Next month"
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => {
              const now = new Date();
              setCurrentDate(now);
              setSelectedDay(now);
            }}
            className="h-8 px-3 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-colors shadow-xs"
          >
            Today
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      ) : (
        /* Main Grid: Calendar Month & Selected Day Drawer */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Month Grid (2 cols) */}
          <div className="lg:col-span-2 p-4 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-3">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="uppercase font-mono text-[10px] tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Month day cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {paddingArray.map((p) => (
                <div
                  key={`pad-${p}`}
                  className="h-20 rounded-lg bg-[#F5F6F8]/60 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/40 opacity-40"
                />
              ))}

              {daysArray.map((dayNum) => {
                const cellDate = new Date(year, month, dayNum);
                const isSelected = isSameDay(cellDate, selectedDay);
                const isToday = isSameDay(cellDate, new Date());
                const dayOfWeek = cellDate.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                // Items on this day
                const dayItems = scheduleItems.filter((it) =>
                  isSameDay(new Date(it.start_time), cellDate)
                );

                return (
                  <div
                    key={dayNum}
                    onClick={() => setSelectedDay(cellDate)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedDay(cellDate);
                      }
                    }}
                    className={`h-20 p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#EEF2FF] dark:bg-[#5B5CE2]/20 border-[#5B5CE2] ring-1 ring-[#5B5CE2]"
                        : isToday
                        ? "bg-[#F5F6F8] dark:bg-slate-800/40 border-[#5B5CE2]/40"
                        : isWeekend
                        ? "bg-[#FAFBFC] dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                        : "bg-white dark:bg-[#161B22] border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono ${
                          isToday
                            ? "text-[#5B5CE2] font-bold"
                            : isSelected
                            ? "text-[#5B5CE2] font-bold"
                            : "text-slate-700 dark:text-slate-300 font-medium"
                        }`}
                      >
                        {dayNum}
                      </span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5B5CE2]" title="Today" />
                      )}
                    </div>

                    {/* Task count indicators */}
                    <div className="space-y-0.5 overflow-hidden">
                      {dayItems.slice(0, 2).map((it) => (
                        <div
                          key={it.id}
                          className={`text-[9px] truncate px-1 py-0.2 rounded font-medium ${
                            it.locked
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                              : it.status === "MODIFIED"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {it.task?.title || "Task"}
                        </div>
                      ))}
                      {dayItems.length > 2 && (
                        <span className="text-[9px] text-slate-400 block text-right font-mono">
                          +{dayItems.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Day Agenda Drawer (1 col) */}
          <div className="p-4 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-3">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#5B5CE2] block">
                Agenda Focus
              </span>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">
                {selectedDay.toLocaleDateString([], {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedDayItems.length} Scheduled Blocks
              </p>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {selectedDayItems.length === 0 ? (
                <EmptyState
                  icon={<CalendarIcon className="w-7 h-7 text-slate-400" />}
                  title="No events scheduled"
                  description="This day is clear. AI planner will schedule high-priority tasks here during replanning."
                />
              ) : (
                selectedDayItems.map((item) => {
                  const s = new Date(item.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                  const e = new Date(item.end_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });

                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-[#F5F6F8] dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1.5 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <StatusBadge status={item.status} locked={item.locked} />
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {s} – {e}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {item.task?.title}
                      </h4>

                      <div className="flex items-center justify-between pt-0.5 text-[11px] text-slate-400">
                        {item.task && <PriorityBadge priority={item.task.priority} />}
                        {item.locked && (
                          <span className="flex items-center gap-1 text-[10px] text-blue-600 font-mono">
                            <Lock className="w-3 h-3" /> Pinned
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
