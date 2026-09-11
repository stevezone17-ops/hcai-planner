import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle,
  AlertCircle,
  LayoutGrid,
  List,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { api } from "../services/api";
import { Task, PriorityType } from "../types";
import { PriorityBadge } from "../components/PriorityBadge";
import { TaskModal } from "../components/TaskModal";
import { TaskConfirmationModal } from "../components/TaskConfirmationModal";
import { parseNaturalLanguageTask, ParsedTask } from "../utils/taskParser";

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Quick Add Natural Language
  const [quickAddText, setQuickAddText] = useState("");
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [pendingParsedTask, setPendingParsedTask] = useState<ParsedTask | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await api.tasks.getAll();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      await api.tasks.update(editingTask.id, taskData);
    } else {
      await api.tasks.create(taskData);
    }
    await loadTasks();
  };

  const handleDeleteTask = async (id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await api.tasks.delete(id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const nextStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      const updated = await api.tasks.update(task.id, { status: nextStatus as any });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Natural Language Quick Add Parser
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddText.trim()) return;

    const parsed = parseNaturalLanguageTask(quickAddText);
    setPendingParsedTask(parsed);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmQuickAdd = async () => {
    if (!pendingParsedTask) return;
    setIsQuickAdding(true);
    try {
      await api.tasks.create({
        title: pendingParsedTask.title,
        priority: pendingParsedTask.priority,
        duration_minutes: pendingParsedTask.duration_minutes,
        deadline: pendingParsedTask.deadline,
        category: pendingParsedTask.category,
        difficulty: pendingParsedTask.difficulty,
      });
      setQuickAddText("");
      setIsConfirmModalOpen(false);
      setPendingParsedTask(null);
      await loadTasks();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsQuickAdding(false);
    }
  };

  const handleEditParsedTask = () => {
    if (!pendingParsedTask) return;
    setEditingTask({
      id: 0,
      user_id: 1,
      title: pendingParsedTask.title,
      description: "",
      category: pendingParsedTask.category,
      priority: pendingParsedTask.priority,
      duration_minutes: pendingParsedTask.duration_minutes,
      deadline: pendingParsedTask.deadline,
      difficulty: pendingParsedTask.difficulty,
      status: "PENDING",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setIsConfirmModalOpen(false);
    setIsModalOpen(true);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    const matchesPriority = selectedPriority === "All" || t.priority === selectedPriority;
    const matchesStatus = selectedStatus === "All" || t.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const categories = ["All", ...Array.from(new Set(tasks.map((t) => t.category)))];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Completed
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-[#5B5CE2] dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Scheduled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
            Tasks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Capture, organize, and prioritize tasks with natural language or structured forms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white dark:bg-[#161B22] p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-[#F5F6F8] dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "board"
                  ? "bg-[#F5F6F8] dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
              }`}
              title="Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="h-8 px-3 rounded-lg text-xs font-medium text-white bg-[#5B5CE2] hover:bg-[#4F46E5] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Quick Add Natural Language Bar */}
      <form onSubmit={handleQuickAdd} className="relative">
        <input
          type="text"
          value={quickAddText}
          onChange={(e) => setQuickAddText(e.target.value)}
          placeholder="Quick add: e.g. 'Network Security presentation tomorrow 2h high priority' (Press Enter)"
          className="w-full pl-9 pr-24 h-10 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 shadow-xs focus:outline-none focus:border-[#5B5CE2] focus:ring-1 focus:ring-[#5B5CE2]"
        />
        <Sparkles className="w-3.5 h-3.5 text-[#5B5CE2] absolute left-3 top-1/2 -translate-y-1/2" />
        <button
          type="submit"
          disabled={!quickAddText.trim() || isQuickAdding}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-2.5 rounded-md text-xs font-medium bg-[#5B5CE2] hover:bg-[#4F46E5] disabled:opacity-40 text-white transition-colors"
        >
          {isQuickAdding ? "Adding..." : "Add"}
        </button>
      </form>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-8 pr-3 h-8 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 shadow-xs focus:outline-none focus:border-[#5B5CE2]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-8 px-2.5 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 shadow-xs focus:outline-none focus:border-[#5B5CE2]"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              Category: {c}
            </option>
          ))}
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="h-8 px-2.5 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 shadow-xs focus:outline-none focus:border-[#5B5CE2]"
        >
          <option value="All">Priority: All</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-8 px-2.5 bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 shadow-xs focus:outline-none focus:border-[#5B5CE2]"
        >
          <option value="All">Status: All</option>
          <option value="PENDING">Pending</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* View Mode: List vs Board */}
      {viewMode === "list" ? (
        <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBFC] dark:bg-[#161B22] text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 w-10">Done</th>
                  <th className="py-2.5 px-3">Task</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Deadline</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No tasks found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => {
                    const isDone = t.status === "COMPLETED";
                    const isOverdue = t.deadline && new Date(t.deadline) < new Date() && !isDone;

                    return (
                      <tr
                        key={t.id}
                        className={`hover:bg-[#F5F6F8] dark:hover:bg-slate-800/40 transition-colors ${
                          isDone ? "opacity-60" : ""
                        }`}
                      >
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleComplete(t)}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              isDone
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "border-slate-300 dark:border-slate-600 hover:border-[#5B5CE2]"
                            }`}
                          >
                            {isDone && <CheckCircle className="w-3.5 h-3.5" />}
                          </button>
                        </td>

                        <td className="py-3 px-3 max-w-xs">
                          <p className={`font-medium text-slate-900 dark:text-white ${isDone ? "line-through text-slate-400 dark:text-slate-500" : ""}`}>
                            {t.title}
                          </p>
                          {t.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {t.description}
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                            {t.category}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <PriorityBadge priority={t.priority} />
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                          {t.duration_minutes}m
                        </td>

                        <td className="py-3 px-3">
                          {t.deadline ? (
                            <span className={isOverdue ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-slate-600 dark:text-slate-400"}>
                              {new Date(t.deadline).toLocaleDateString([], { month: "short", day: "numeric" })}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-600">—</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {getStatusBadge(t.status)}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingTask(t);
                                setIsModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(t.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Board View (Kanban) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["PENDING", "SCHEDULED", "COMPLETED"] as const).map((colStatus) => {
            const colTasks = filteredTasks.filter((t) => t.status === colStatus);

            return (
              <div key={colStatus} className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {colStatus} ({colTasks.length})
                  </span>
                </div>

                <div className="space-y-2">
                  {colTasks.length === 0 ? (
                    <div className="p-4 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                      No tasks
                    </div>
                  ) : (
                    colTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-lg bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <PriorityBadge priority={t.priority} />
                          <span className="text-[11px] font-mono text-slate-400">
                            {t.duration_minutes}m
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{t.title}</h4>
                        {t.deadline && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Due {new Date(t.deadline).toLocaleDateString([], { month: "short", day: "numeric" })}
                            </span>
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />

      {/* Task Natural Language Confirmation Modal */}
      <TaskConfirmationModal
        isOpen={isConfirmModalOpen}
        parsedTask={pendingParsedTask}
        onConfirm={handleConfirmQuickAdd}
        onEdit={handleEditParsedTask}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setPendingParsedTask(null);
        }}
      />
    </div>
  );
};
