"use client";

import { DayProgress, Category } from "@/Types/DashboardTypes";
import DayCard from "./DayCard";

interface DaysGridProps {
  days: DayProgress[];
  categories: Category[];
  onCreateTask: (payload: {
    title: string;
    weight: number;
    categoryId: string;
    date: string;
    completed: boolean;
  }) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function DaysGrid({
  days,
  categories,
  onCreateTask,
  onToggleTask,
  onDeleteTask,
}: DaysGridProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Daily breakdown</h2>
        <p className="mt-1 text-slate-400">
          Manage tasks and track progress for each day
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((day) => (
          <DayCard
            key={day.date}
            day={day}
            categories={categories}
            onCreateTask={onCreateTask}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
}
