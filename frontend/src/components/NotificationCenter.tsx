import React, { useState, useEffect, useRef } from "react";
import { Bell, X, Calendar, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import type { ScheduleItem, Task } from "../types";

export interface Notification {
  id: string;
  type: "upcoming" | "capacity" | "schedule_change" | "deadline" | "achievement";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

interface NotificationCenterProps {
  scheduleItems: ScheduleItem[];
  tasks: Task[];
  onNavigate?: (tab: string) => void;
}

function generateNotifications(
  scheduleItems: ScheduleItem[],
  tasks: Task[]
): Notification[] {
  const notifications: Notification[] = [];
  const now = new Date();

  // Upcoming task notifications (within 30 minutes)
  scheduleItems.forEach((item) => {
    const start = new Date(item.start_time);
    const diffMs = start.getTime() - now.getTime();
    const diffMins = diffMs / 60000;

    if (diffMins > 0 && diffMins <= 30 && item.status !== "COMPLETED" && item.status !== "REJECTED") {
      notifications.push({
        id: `upcoming-${item.id}`,
        type: "upcoming",
        title: "Task Starting Soon",
        message: `${item.task?.title || `Task #${item.task_id}`} starts in ${Math.round(diffMins)} minutes.`,
        timestamp: now,
        read: false,
      });
    }
  });

  // Capacity warning
  const today = now.toISOString().split("T")[0];
  const todayItems = scheduleItems.filter(
    (s) => s.start_time.startsWith(today) && s.status !== "REJECTED" && s.status !== "CANCELLED"
  );
  const totalMins = todayItems.reduce((sum, s) => {
    return sum + (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 60000;
  }, 0);
  if (totalMins > 480) {
    notifications.push({
      id: "capacity-warn",
      type: "capacity",
      title: "Over Capacity",
      message: `Schedule is ${Math.round((totalMins - 480) / 60)}h ${Math.round((totalMins - 480) % 60)}m over your daily capacity.`,
      timestamp: now,
      read: false,
    });
  }

  // Deadline approaching (within 24h)
  tasks.forEach((task) => {
    if (task.deadline && task.status !== "COMPLETED") {
      const deadline = new Date(task.deadline);
      const diffH = (deadline.getTime() - now.getTime()) / 3600000;
      if (diffH > 0 && diffH <= 24) {
        notifications.push({
          id: `deadline-${task.id}`,
          type: "deadline",
          title: "Deadline Approaching",
          message: `${task.title} is due in ${Math.round(diffH)} hours.`,
          timestamp: now,
          read: false,
        });
      }
    }
  });

  // Schedule change (recently modified items)
  const modifiedCount = scheduleItems.filter(
    (s) => s.status === "MODIFIED" && s.start_time.startsWith(today)
  ).length;
  if (modifiedCount > 0) {
    notifications.push({
      id: "schedule-changes",
      type: "schedule_change",
      title: "Schedule Updated",
      message: `${modifiedCount} task${modifiedCount > 1 ? "s were" : " was"} modified today.`,
      timestamp: now,
      read: false,
    });
  }

  return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

const notifIcons: Record<string, React.ReactNode> = {
  upcoming: <Clock className="w-3.5 h-3.5 text-[#5B5CE2]" />,
  capacity: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
  schedule_change: <Calendar className="w-3.5 h-3.5 text-blue-500" />,
  deadline: <AlertTriangle className="w-3.5 h-3.5 text-red-500" />,
  achievement: <CheckCircle className="w-3.5 h-3.5 text-green-500" />,
};

const notifColors: Record<string, string> = {
  upcoming: "bg-[#EEF2FF] dark:bg-[#5B5CE2]/15",
  capacity: "bg-amber-50 dark:bg-amber-500/15",
  schedule_change: "bg-blue-50 dark:bg-blue-500/15",
  deadline: "bg-red-50 dark:bg-red-500/15",
  achievement: "bg-green-50 dark:bg-green-500/15",
};

export function NotificationCenter({ scheduleItems, tasks, onNavigate }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notifications = generateNotifications(scheduleItems, tasks);
  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        id="notification-bell"
        className="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1F242C] rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] text-[#5B5CE2] dark:text-[#797BF2] hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 dark:text-slate-500">No notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                    readIds.has(n.id) ? "opacity-60" : ""
                  }`}
                  onClick={() => {
                    setReadIds((prev) => new Set([...prev, n.id]));
                    if (n.type === "upcoming" || n.type === "schedule_change") {
                      onNavigate?.("timetable");
                      setOpen(false);
                    }
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-6 h-6 rounded-md ${notifColors[n.type]} flex items-center justify-center shrink-0 mt-0.5`}>
                      {notifIcons[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                    {!readIds.has(n.id) && (
                      <span className="w-2 h-2 bg-[#5B5CE2] dark:bg-[#797BF2] rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
