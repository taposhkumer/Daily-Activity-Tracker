"use client";

import { useEffect, useState } from "react";
import { DayProgress, Category } from "@/Types/DashboardTypes";
import { Plus } from "lucide-react";
import OverallProgress from "./OverallProgress";
import CategoryBars from "./CategoryBars";
import TaskItem from "./TaskItem";

interface CreateTaskPayload {
  title: string;
  weight: number;
  categoryId: string;
  date: string;
  completed: boolean;
}

interface DayCardProps {
  day: DayProgress;
  categories: Category[];
  onCreateTask: (task: CreateTaskPayload) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function DayCard({
  day,
  categories,
  onCreateTask,
  onToggleTask,
  onDeleteTask,
}: DayCardProps) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskWeight, setTaskWeight] = useState(5);
  const [taskCategoryId, setTaskCategoryId] = useState(categories[0]?.id || "");

  useEffect(() => {
    if (!categories.some((category) => category.id === taskCategoryId)) {
      setTaskCategoryId(categories[0]?.id || "");
    }
  }, [categories, taskCategoryId]);

  const handleAddTask = () => {
    if (!taskTitle.trim() || !taskCategoryId) return;

    onCreateTask({
      title: taskTitle.trim(),
      weight: taskWeight,
      categoryId: taskCategoryId,
      date: day.date,
      completed: false,
    });
    setTaskTitle("");
    setTaskWeight(5);
    setTaskCategoryId(categories[0]?.id || "");
    setShowAddTask(false);
  };

  const dateObj = new Date(day.date);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-2xl border border-slate-800/50 bg-slate-900/60 p-6 backdrop-blur-sm transition-all hover:border-slate-700/50">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-100">
          {day.dayName} • {formattedDate}
        </h2>
        <p className="text-xs text-slate-500">
          {day.completedCount} of {day.totalCount} tasks completed
        </p>
      </div>

      {/* Overall Daily Progress */}
      <div className="mb-4">
        <OverallProgress
          percentage={day.overallPercentage}
          label="Daily progress"
          size="md"
        />
      </div>

      {/* Category Progress */}
      <div className="mb-4">
        <CategoryBars categories={day.categories} size="sm" />
      </div>

      {/* Tasks List */}
      <div className="mb-4 space-y-2">
        {day.tasks.length > 0 ? (
          day.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              category={categories.find((c) => c.id === task.categoryId)}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
            />
          ))
        ) : (
          <p className="text-sm text-slate-400 py-2">No tasks for this day</p>
        )}
      </div>

      {/* Add Task Form */}
      {showAddTask ? (
        <div className="space-y-3 rounded-xl border border-slate-700/50 bg-slate-800/50 p-3">
          <input
            type="text"
            placeholder="Task title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="w-full rounded-lg bg-slate-700/50 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:bg-slate-700 focus:ring-1 focus:ring-cyan-400"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Weight (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={taskWeight}
                onChange={(e) => setTaskWeight(Number(e.target.value))}
                className="w-full rounded-lg bg-slate-700/50 px-3 py-2 text-sm text-slate-100 outline-none focus:bg-slate-700 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Category
              </label>
              <select
                value={taskCategoryId}
                onChange={(e) => setTaskCategoryId(e.target.value)}
                className="w-full rounded-lg bg-slate-700/50 px-3 py-2 text-sm text-slate-100 outline-none focus:bg-slate-700 focus:ring-1 focus:ring-cyan-400"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddTask}
              disabled={!categories.length}
              className="flex-1 rounded-lg bg-cyan-500/80 px-3 py-2 text-sm font-medium text-slate-950 transition-all hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700/40"
            >
              Add task
            </button>
            <button
              onClick={() => setShowAddTask(false)}
              className="flex-1 rounded-lg bg-slate-700/50 px-3 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
          {!categories.length && (
            <p className="text-sm text-rose-300">
              Add a category first to create tasks.
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowAddTask(true)}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-700 px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:border-slate-600 hover:text-slate-300 hover:bg-slate-800/50"
        >
          <Plus className="w-4 h-4" />
          Add task
        </button>
      )}
    </div>
  );
}
