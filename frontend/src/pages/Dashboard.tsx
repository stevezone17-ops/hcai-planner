import React, { useState, useEffect } from "react";
import {
  Clock,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Calendar,
  Lock,
  Edit3,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../services/api";
import { Task, ScheduleItem, AnalyticsData } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [tasksData, scheduleData, analyticsData] = await Promise.all([
        api.tasks.getAll(),
        api.schedule.getAll({ include_rejected: false }),
        api.analytics.get(),
      ]);

      setTasks(tasksData);
      setAnalytics(analyticsData);

      const today = new Date();
      const todayItems = scheduleData
        .filter((it) => {
          const d = new Date(it.start_time);
          return (
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
          );
        })
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

      setTodaySchedule(todayItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  // Active / Next Focus Task
  const now = new Date();
  const currentFocusItem =
    todaySchedule.find((it) => new Date(it.end_time) > now && it.status !== "COMPLETED") ||
    todaySchedule[0];

  // Highest-risk upcoming deadline
  const urgentDeadlines = tasks
    .filter((t) => t.deadline && t.status !== "COMPLETED")
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
  const highestRiskTask = urgentDeadlines[0];

  // Calculated remaining hours today
  const remainingHoursToday = todaySchedule
    .filter((it) => it.status !== "COMPLETED")
    .reduce((acc, it) => {
      const dur = (new Date(it.end_time).getTime() - new Date(it.start_time).getTime()) / (1000 * 3600);
      return acc + dur;
    }, 0);

  // Greeting based on hour
  const currentHour = now.getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="space-y-7"
    >
      {/* 1. Header & Compact Statistics Bar (No Giant Cards) */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {greeting}, Alex. Here's what your schedule looks like today.
          </p>
        </div>

        {/* Compact Horizontal Statistics Row */}
        <div className="flex flex-wrap items-center gap-y-3 gap-x-6 sm:gap-x-10 py-3.5 px-4 rounded-xl bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {analytics ? analytics.planned_hours : 17.8}h
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">Planned</span>
          </div>

          <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {analytics ? analytics.hitl_metrics.acceptance_rate : 83}%
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">AI acceptance</span>
          </div>

          <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {analytics ? analytics.hitl_metrics.modified_count : 1}
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">Human modification</span>
          </div>

          <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[#5B5CE2] dark:text-[#797BF2]">
              {analytics ? analytics.schedule_efficiency : 98}%
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">Schedule efficiency</span>
          </div>
        </div>
      </div>

      {/* 2. CURRENT FOCUS ("NOW") - Central focal object */}
      {currentFocusItem ? (
        <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs relative overflow-hidden group">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Current Focus
              </span>
              <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                {new Date(currentFocusItem.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} —{" "}
                {new Date(currentFocusItem.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={currentFocusItem.status} locked={currentFocusItem.locked} />
              {currentFocusItem.task && <PriorityBadge priority={currentFocusItem.task.priority} />}
            </div>
          </div>

          <div className="pt-4 pb-2 space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {currentFocusItem.task?.title || "Scheduled Task"}
            </h2>
            {currentFocusItem.task?.description && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {currentFocusItem.task.description}
              </p>
            )}
            {currentFocusItem.ai_reason && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-1">
                “{currentFocusItem.ai_reason}”
              </p>
            )}
          </div>

          <div className="pt-4 flex items-center gap-2.5 border-t border-slate-100 dark:border-slate-800 mt-3">
            <button
              onClick={() => onNavigate("timetable")}
              className="h-8 px-3 rounded-lg text-xs font-medium text-white bg-[#5B5CE2] hover:bg-[#4F46E5] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>View in Timetable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate("tasks")}
              className="h-8 px-3 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Open Task List
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-500">
          No tasks scheduled for today. Launch the AI Planner to build a timetable.
        </div>
      )}

      {/* 3. Main Split: Today's Vertical Timeline & Health / AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Today's Vertical Productivity Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                Today's Schedule
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chronological sequence with human decision status.
              </p>
            </div>
            <button
              onClick={() => onNavigate("timetable")}
              className="text-xs font-medium text-[#5B5CE2] hover:text-[#4F46E5] flex items-center gap-1"
            >
              <span>Open Grid</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todaySchedule.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No tasks scheduled for today.
            </div>
          ) : (
            /* Vertical Productivity Timeline */
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-5 my-2 ml-3">
              {todaySchedule.map((item, idx) => {
                const s = new Date(item.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                const e = new Date(item.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                const task = item.task;
                const isCurrent = currentFocusItem?.id === item.id;

                return (
                  <div key={item.id} className="relative group">
                    {/* Node marker on the vertical line */}
                    <span
                      className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 transition-all ${
                        isCurrent
                          ? "bg-[#5B5CE2] border-white dark:border-[#161B22] ring-2 ring-[#5B5CE2]/30"
                          : item.locked
                          ? "bg-blue-500 border-white dark:border-[#161B22]"
                          : item.status === "MODIFIED"
                          ? "bg-amber-500 border-white dark:border-[#161B22]"
                          : item.status === "ACCEPTED"
                          ? "bg-emerald-500 border-white dark:border-[#161B22]"
                          : "bg-slate-300 dark:bg-slate-600 border-white dark:border-[#161B22]"
                      }`}
                    />

                    {/* Timeline Event Row */}
                    <div
                      onClick={() => onNavigate("timetable")}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        isCurrent
                          ? "bg-white dark:bg-[#161B22] border-slate-300 dark:border-slate-700 shadow-xs"
                          : "bg-white/70 hover:bg-white dark:bg-[#161B22]/60 dark:hover:bg-[#161B22] border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {s} – {e}
                          </span>
                          <StatusBadge status={item.status} locked={item.locked} />
                          {task && <PriorityBadge priority={task.priority} />}
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {task ? task.title : "Task"}
                        </h4>
                        {item.ai_reason && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {item.ai_reason}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {task?.duration_minutes && (
                          <span className="text-[11px] font-mono text-slate-400">
                            {task.duration_minutes}m
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Health & Learned Insights */}
        <div className="space-y-5">
          {/* Schedule Health Panel */}
          <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Schedule Health
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Zero Conflicts
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {remainingHoursToday.toFixed(1)}h
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Remaining capacity scheduled for today.
              </p>
            </div>

            {highestRiskTask && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Next Deadline
                </span>
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {highestRiskTask.title}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Due {new Date(highestRiskTask.deadline!).toLocaleDateString([], { month: "short", day: "numeric" })} at{" "}
                  {new Date(highestRiskTask.deadline!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            )}
          </div>

          {/* Learned From You Panel */}
          <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Learned From You
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#5B5CE2]" />
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You frequently adjust high-priority deep work into morning focus windows.
            </p>

            <div className="p-2.5 rounded-lg bg-[#F5F6F8] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                → Adaptive Action:
              </span>
              <p>The planner automatically reserves 09:00 — 12:00 for complex tasks.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
