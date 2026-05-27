"use client";

import { Task, Category } from "@/Types/DashboardTypes";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";

interface TaskItemProps {
  task: Task;
  category: Category | undefined;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskItem({ task, category, onToggle, onDelete }: TaskItemProps) {
  const categoryColorMap: Record<string, string> = {
    Study: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    Health: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Coding: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    Reading: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  };

  const categoryClass =
    categoryColorMap[category?.name || ""] ||
    "bg-slate-500/20 text-slate-300 border-slate-500/30";

  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-slate-700/50 bg-slate-800/50 p-3 transition-all hover:bg-slate-800 hover:border-slate-700"
    >
      <button
        onClick={() => onToggle(task.id)}
        className="mt-1 shrink-0 text-slate-400 hover:text-cyan-400 transition-colors"
      >
        {task.completed ? (
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            task.completed
              ? "line-through text-slate-400"
              : "text-slate-100"
          }`}
        >
          {task.title}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-slate-700/50 px-2 py-1 text-xs font-medium text-slate-300">
            {task.weight}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${categoryClass}`}
          >
            {category?.name || "Unknown"}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        className="mt-1 shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-rose-400"
        title="Delete task"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
