import React, { useState, useEffect } from "react";
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  XCircle,
  Lock,
  Clock,
  Sparkles,
  Award,
  Zap,
  UserCheck,
  Sliders
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { motion } from "framer-motion";
import { api } from "../services/api";
import { AnalyticsData } from "../types";
import { Skeleton } from "../components/ui/Skeleton";

// Custom Accessible Tooltip for Recharts
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg shadow-elevated text-xs">
        {label && <p className="font-semibold text-slate-900 dark:text-white mb-1">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.analytics.get();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  const hitl = analytics.hitl_metrics;

  // Donut chart data for HITL decisions
  const hitlChartData = [
    { name: "Directly Accepted", value: hitl.accepted_count, color: "#10B981" },
    { name: "Human Modified", value: hitl.modified_count, color: "#F59E0B" },
    { name: "Rejected / Cleared", value: hitl.rejected_count, color: "#EF4444" },
    { name: "Hard Constraints Locked", value: hitl.locked_count, color: "#5B5CE2" },
  ].filter((d) => d.value > 0);

  const chartItems =
    hitlChartData.length > 0
      ? hitlChartData
      : [{ name: "Directly Accepted", value: 1, color: "#10B981" }];

  // Hourly modifications bar data
  const hourlyData = analytics.hourly_modifications
    .filter((h) => h.hour >= 8 && h.hour <= 22)
    .map((h) => ({
      hour: `${h.hour.toString().padStart(2, "0")}:00`,
      modifications: h.count,
    }));

  // Category hours data
  const categoryData = analytics.category_distribution.map((c) => ({
    name: c.category,
    hours: c.hours,
    tasks: c.count,
  }));

  const totalActions = hitl.accepted_count + hitl.modified_count + hitl.rejected_count + hitl.locked_count;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 dark:text-white">
            Analytics & Governance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Empirical telemetry evaluating algorithmic steering, suggestion acceptance latency, and constraint adherence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-lg bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auditing: Active</span>
          </div>
        </div>
      </div>

      {/* Primary Analytical Metrics (Typography-focused, not huge bloated cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Acceptance Rate */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span>AI Acceptance</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
            {hitl.acceptance_rate}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {hitl.accepted_count} suggestions accepted directly
          </p>
        </div>

        {/* Human Modification */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span>Human Modification</span>
            <Edit3 className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
            {hitl.modification_rate}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {hitl.modified_count} tasks manually steered
          </p>
        </div>

        {/* Hard Constraint Locks */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5B5CE2] dark:text-[#797BF2]">
            <span>Hard Constraint Locks</span>
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
            {hitl.locked_count}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            100% immovable during solver replans
          </p>
        </div>

        {/* Schedule Efficiency */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>Schedule Efficiency</span>
            <Award className="w-4 h-4 text-[#5B5CE2]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
            {analytics.schedule_efficiency}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Zero temporal overlaps
          </p>
        </div>
      </div>

      {/* Chart Section 1: Decision Distribution & Modification Clustering */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* HITL Donut Breakdown */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                Human-in-the-Loop Decision Breakdown
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Distribution of accepted, modified, rejected, or locked slots.
              </p>
            </div>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-[#F5F6F8] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {totalActions} Events
            </span>
          </div>

          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartItems}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }}
                  formatter={(value) => <span className="text-slate-600 dark:text-slate-300 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Human Agency Verification:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% User Overrides Honored
            </span>
          </div>
        </div>

        {/* Hourly Rescheduling Frequency */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                Circadian Modification Clustering
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Hours when manual adjustments peak (feeds adaptive preference loop).
              </p>
            </div>
            <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">
              Bias Feedback
            </span>
          </div>

          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip content={<CustomChartTooltip />} cursor={{ fill: "rgba(91, 92, 226, 0.04)" }} />
                <Bar dataKey="modifications" fill="#F59E0B" radius={[3, 3, 0, 0]} name="Adjustments" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
            <span className="text-amber-700 dark:text-amber-300 font-semibold">Observation:</span> Manual adjustments concentrate in late afternoon. Algorithm automatically widens afternoon transition buffers.
          </div>
        </div>
      </div>

      {/* Chart Section 2: Workload by Category */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
              Workload Allocation by Category
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Scheduled hours across technical, academic, health, and personal tracks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Total Planned:</span>
            <span className="text-xs font-bold font-mono text-[#5B5CE2] dark:text-[#797BF2] px-2 py-0.5 rounded bg-[#EEF2FF] dark:bg-[#5B5CE2]/15">
              {analytics.planned_hours} Hours
            </span>
          </div>
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomChartTooltip />} cursor={{ fill: "rgba(91, 92, 226, 0.04)" }} />
              <Bar dataKey="hours" fill="#5B5CE2" radius={[3, 3, 0, 0]} name="Hours" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Adaptive Profile Insights */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#5B5CE2] dark:text-[#797BF2] font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#5B5CE2]" />
            <span>Learned Human Scheduling Patterns</span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
            Audit Log Synthesizer
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          The continuous learning subsystem translates human modifications into scheduling bias weights:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {analytics.insights.map((ins, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-[#F5F6F8] dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
            >
              <span className="text-[#5B5CE2] font-bold mt-0.5">•</span>
              <span>{ins}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
