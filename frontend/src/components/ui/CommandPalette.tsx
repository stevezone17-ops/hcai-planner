import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  LayoutDashboard,
  CheckSquare,
  Sparkles,
  CalendarDays,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  RefreshCw,
  Sun,
  Moon,
  X
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  category: "Navigation" | "Actions" | "Preferences";
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenNewTask?: () => void;
  onToggleTheme?: () => void;
  onResetDemo?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenNewTask,
  onToggleTheme,
  onResetDemo,
}) => {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: "create-task",
      label: "Create New Task",
      category: "Actions",
      icon: <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      shortcut: "C",
      action: () => {
        onClose();
        if (onOpenNewTask) onOpenNewTask();
      },
    },
    {
      id: "generate-schedule",
      label: "Generate AI Timetable",
      category: "Actions",
      icon: <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      action: () => {
        onClose();
        onNavigate("planner");
      },
    },
    {
      id: "replan-schedule",
      label: "Replan Remaining Tasks",
      category: "Actions",
      icon: <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      action: () => {
        onClose();
        onNavigate("timetable");
      },
    },
    {
      id: "nav-dashboard",
      label: "Go to Dashboard",
      category: "Navigation",
      icon: <LayoutDashboard className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
      action: () => {
        onClose();
        onNavigate("dashboard");
      },
    },
    {
      id: "nav-tasks",
      label: "Go to Tasks Inventory",
      category: "Navigation",
      icon: <CheckSquare className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
      action: () => {
        onClose();
        onNavigate("tasks");
      },
    },
    {
      id: "nav-planner",
      label: "Go to AI Planner",
      category: "Navigation",
      icon: <Sparkles className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
      action: () => {
        onClose();
        onNavigate("planner");
      },
    },
    {
      id: "nav-timetable",
      label: "Go to Timetable",
      category: "Navigation",
      icon: <CalendarDays className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
      action: () => {
        onClose();
        onNavigate("timetable");
      },
    },
    {
      id: "nav-calendar",
      label: "Go to Calendar",
      category: "Navigation",
      icon: <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
      action: () => {
        onClose();
        onNavigate("calendar");
      },
    },
    {
      id: "nav-analytics",
      label: "Go to Analytics & Telemetry",
      category: "Navigation",
      icon: <BarChart3 className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
      action: () => {
        onClose();
        onNavigate("analytics");
      },
    },
    {
      id: "nav-settings",
      label: "Go to Settings",
      category: "Navigation",
      icon: <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />,
      action: () => {
        onClose();
        onNavigate("settings");
      },
    },
    {
      id: "pref-theme",
      label: "Toggle Theme (Light/Dark)",
      category: "Preferences",
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      action: () => {
        onClose();
        if (onToggleTheme) onToggleTheme();
      },
    },
    {
      id: "pref-reset",
      label: "Reset Demo Seed Data",
      category: "Preferences",
      icon: <RefreshCw className="w-4 h-4 text-red-500" />,
      action: () => {
        onClose();
        if (onResetDemo) onResetDemo();
      },
    },
  ];

  const filteredCommands = commands.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search actions..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-1.5 divide-y divide-slate-100 dark:divide-slate-800/40">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching commands found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs text-left transition-colors ${
                    isSelected
                      ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="shrink-0">{cmd.icon}</span>
                    <span className="font-medium">{cmd.label}</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                    {cmd.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to close</span>
          </div>
          <span className="font-medium text-slate-400">HCAI Planner Command Palette</span>
        </div>
      </div>
    </div>
  );
};
