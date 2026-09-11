import React, { useState, useEffect } from "react";
import { Task, PriorityType, DifficultyType } from "../types";
import { X, Calendar, Clock, AlertCircle } from "lucide-react";
import { Button } from "./ui/Button";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  initialTask?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Academic");
  const [priority, setPriority] = useState<PriorityType>("Medium");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [deadline, setDeadline] = useState("");
  const [preferredStart, setPreferredStart] = useState("");
  const [preferredEnd, setPreferredEnd] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyType>("Medium");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || "");
      setCategory(initialTask.category);
      setPriority(initialTask.priority);
      setDurationMinutes(initialTask.duration_minutes);
      setDeadline(
        initialTask.deadline ? initialTask.deadline.slice(0, 16) : ""
      );
      setPreferredStart(initialTask.preferred_start || "");
      setPreferredEnd(initialTask.preferred_end || "");
      setDifficulty(initialTask.difficulty);
      setNotes(initialTask.notes || "");
    } else {
      setTitle("");
      setDescription("");
      setCategory("Academic");
      setPriority("Medium");
      setDurationMinutes(60);
      setDeadline("");
      setPreferredStart("");
      setPreferredEnd("");
      setDifficulty("Medium");
      setNotes("");
    }
    setError(null);
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        duration_minutes: Number(durationMinutes),
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        preferred_start: preferredStart || undefined,
        preferred_end: preferredEnd || undefined,
        difficulty,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {initialTask ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Network Security Lab Assignment"
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              >
                <option value="Academic">Academic</option>
                <option value="Coursework">Coursework</option>
                <option value="Coding">Coding</option>
                <option value="Research">Research</option>
                <option value="Project">Project</option>
                <option value="Personal">Personal</option>
                <option value="Reading">Reading</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityType)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              >
                <option value="Critical">Critical (Must do)</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Duration & Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="15"
                max="720"
                step="15"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyType)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              >
                <option value="Easy">Easy (Light focus)</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard (Deep focus)</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Deadline (Hard Constraint)
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
            />
          </div>

          {/* Preferred Time Window */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Preferred Start
              </label>
              <input
                type="time"
                value={preferredStart}
                onChange={(e) => setPreferredStart(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Preferred End
              </label>
              <input
                type="time"
                value={preferredEnd}
                onChange={(e) => setPreferredEnd(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Notes / Context
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Important references or details..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={loading}
            >
              {initialTask ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
