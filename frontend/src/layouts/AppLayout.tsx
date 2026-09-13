import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Sparkles,
  CalendarDays,
  Calendar,
  BarChart3,
  Settings,
  Menu,
  X,
  Plus,
  RefreshCw,
  Sun,
  Moon,
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  Globe
} from "lucide-react";
import { api } from "../services/api";
import { CommandPalette } from "../components/ui/CommandPalette";
import { Tooltip } from "../components/ui/Tooltip";
import { Button } from "../components/ui/Button";
import { NotificationCenter } from "../components/NotificationCenter";
import { ScheduleItem, Task } from "../types";

interface AppLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenNewTaskModal?: () => void;
  onTriggerSeedReset?: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onTabChange,
  onOpenNewTaskModal,
  onTriggerSeedReset,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Default to LIGHT MODE as primary experience
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notifSchedule, setNotifSchedule] = useState<ScheduleItem[]>([]);
  const [notifTasks, setNotifTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const [items, tasks] = await Promise.all([
          api.schedule.getAll({ include_rejected: false }),
          api.tasks.getAll(),
        ]);
        setNotifSchedule(items);
        setNotifTasks(tasks);
      } catch (err) {
        // silent fallback
      }
    };
    loadNotifs();
  }, [currentTab]);

  // Sync theme class with document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Global Ctrl + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleResetDemo = async () => {
    if (confirm("Reset database to initial demo state?")) {
      setIsResetting(true);
      try {
        await api.seed.reset();
        if (onTriggerSeedReset) onTriggerSeedReset();
        window.location.reload();
      } catch (err) {
        alert("Failed to reset database");
      } finally {
        setIsResetting(false);
      }
    }
  };

  const workspaceNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "planner", label: "AI Planner", icon: Sparkles },
    { id: "timetable", label: "Timetable", icon: CalendarDays },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const preferenceNavItems = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "landing", label: "Product Tour (3D)", icon: Globe },
  ];

  return (
    <div className={`min-h-screen flex bg-[#F5F6F8] dark:bg-[#0D1117] text-slate-900 dark:text-slate-100 antialiased font-sans ${isDarkMode ? "dark" : ""}`}>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 bg-white/80 dark:bg-[#161B22]/90 border-r border-slate-200/80 dark:border-slate-800/80 z-50 flex flex-col transition-all duration-200 ease-in-out backdrop-blur-xl ${
          sidebarCollapsed ? "w-16" : "w-60"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-[#161B22]/60 backdrop-blur-sm">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => onTabChange("landing")}
            title="Go to Landing Page"
          >
            <div className="w-7 h-7 rounded-lg bg-[#5B5CE2] flex items-center justify-center font-bold text-white text-xs shadow-soft shrink-0 ring-2 ring-indigo-100 dark:ring-indigo-900/40">
              H
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white block truncate leading-none">
                  HCAI Planner
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium tracking-wide mt-0.5 block truncate">
                  HITL Workspace
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Items grouped */}
        <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
          {/* Workspace Group */}
          <div>
            {!sidebarCollapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 pb-1">
                Workspace
              </p>
            )}
            <div className="space-y-0.5">
              {workspaceNavItems.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;

                const buttonEl = (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center ${
                      sidebarCollapsed ? "justify-center px-0 py-2" : "justify-between px-2.5 py-1.5"
                    } rounded-lg text-xs transition-colors duration-100 ${
                      active
                        ? "bg-[#EEF2FF] text-[#5B5CE2] font-semibold dark:bg-[#5B5CE2]/15 dark:text-[#797BF2]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40 font-normal"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          active
                            ? "text-[#5B5CE2] dark:text-[#797BF2]"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </div>
                    {!sidebarCollapsed && active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5B5CE2] dark:bg-[#797BF2]" />
                    )}
                  </button>
                );

                return sidebarCollapsed ? (
                  <Tooltip key={item.id} content={item.label} position="right">
                    {buttonEl}
                  </Tooltip>
                ) : (
                  buttonEl
                );
              })}
            </div>
          </div>

          {/* Preferences Group */}
          <div>
            {!sidebarCollapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2.5 pb-1">
                Preferences
              </p>
            )}
            <div className="space-y-0.5">
              {preferenceNavItems.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;

                const buttonEl = (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center ${
                      sidebarCollapsed ? "justify-center px-0 py-2" : "justify-between px-2.5 py-1.5"
                    } rounded-lg text-xs transition-colors duration-100 ${
                      active
                        ? "bg-[#EEF2FF] text-[#5B5CE2] font-semibold dark:bg-[#5B5CE2]/15 dark:text-[#797BF2]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40 font-normal"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          active
                            ? "text-[#5B5CE2] dark:text-[#797BF2]"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </div>
                    {!sidebarCollapsed && active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5B5CE2] dark:bg-[#797BF2]" />
                    )}
                  </button>
                );

                return sidebarCollapsed ? (
                  <Tooltip key={item.id} content={item.label} position="right">
                    {buttonEl}
                  </Tooltip>
                ) : (
                  buttonEl
                );
              })}
            </div>
          </div>
        </nav>

        {/* Bottom User Card & Actions */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#161B22]/70 space-y-2 backdrop-blur-sm">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-semibold text-xs text-slate-700 dark:text-slate-200 shrink-0">
                    AM
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate leading-tight">Alex Morgan</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Adaptive Profile</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={toggleTheme}
                    id="theme-toggle"
                    title="Toggle Light/Dark Theme"
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
                  </button>
                  <button
                    onClick={handleResetDemo}
                    disabled={isResetting}
                    title="Reset Demo Data"
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <Tooltip content="Toggle Theme" position="right">
                <button
                  onClick={toggleTheme}
                  id="theme-toggle-mini"
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
                </button>
              </Tooltip>
              <Tooltip content="Product Tour" position="right">
                <button
                  onClick={() => onTabChange("landing")}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Globe className="w-4 h-4 text-slate-500" />
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-60"
        }`}
      >
        {/* Topbar Header */}
        <header className="h-14 px-6 bg-white/85 dark:bg-[#161B22]/85 border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30 flex items-center justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-baseline gap-2">
              <h1 className="text-sm font-semibold text-slate-900 dark:text-white capitalize tracking-tight">
                {[...workspaceNavItems, ...preferenceNavItems].find((n) => n.id === currentTab)?.label || "Dashboard"}
              </h1>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">/ Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Command Search */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 h-8 px-2.5 rounded-lg text-xs bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-400 dark:border-slate-700 transition-colors shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px]">Search actions...</span>
              <kbd className="font-mono text-[10px] px-1 py-0.2 rounded bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                ⌘K
              </kbd>
            </button>

            {onOpenNewTaskModal && (
              <button
                onClick={onOpenNewTaskModal}
                className="h-8 px-3 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                <span>New Task</span>
              </button>
            )}

            {/* Notifications Dropdown */}
            <NotificationCenter
              scheduleItems={notifSchedule}
              tasks={notifTasks}
              onNavigate={onTabChange}
            />

            <button
              onClick={() => onTabChange("planner")}
              className="h-8 px-3 rounded-lg text-xs font-medium text-white bg-[#5B5CE2] hover:bg-[#4F46E5] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Planner</span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={onTabChange}
        onOpenNewTask={onOpenNewTaskModal || (() => {})}
        onToggleTheme={toggleTheme}
        onResetDemo={handleResetDemo}
      />
    </div>
  );
};
