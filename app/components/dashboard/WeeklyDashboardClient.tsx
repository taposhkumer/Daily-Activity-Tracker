"use client";

import { useMemo, useState } from "react";
import { Category, Task } from "@/Types/DashboardTypes";
import { calculateWeeklyStats, calculateDayProgress } from "@/lib/dashboardUtils";
import WeeklySummary from "./WeeklySummary";
import DaysGrid from "./DaysGrid";
import CategoryManager from "./CategoryManager";

interface WeeklyDashboardClientProps {
  categories: Category[];
  tasks: Task[];
  weekDateRange: string[];
}

export default function WeeklyDashboardClient({
  categories,
  tasks,
  weekDateRange,
}: WeeklyDashboardClientProps) {
  const [taskList, setTaskList] = useState<Task[]>(tasks);
  const [categoryList, setCategoryList] = useState<Category[]>(categories);

  const weeklyStats = useMemo(
    () => calculateWeeklyStats(weekDateRange, taskList, categoryList),
    [weekDateRange, taskList, categoryList],
  );

  const dayProgressList = useMemo(
    () =>
      weekDateRange.map((date) =>
        calculateDayProgress(date, taskList, categoryList),
      ),
    [weekDateRange, taskList, categoryList],
  );

  const handleToggleTask = async (taskId: string) => {
    const task = taskList.find((item) => item.id === taskId);
    if (!task) return;

    try {
      const response = await fetch("/api/dashboard/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, completed: !task.completed }),
      });
      const result = await response.json();
      if (response.ok && result.task) {
        setTaskList((prev) =>
          prev.map((item) =>
            item.id === result.task.id ? { ...item, ...result.task } : item,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to toggle task", error);
    }
  };

  const handleCreateTask = async (payload: {
    title: string;
    weight: number;
    categoryId: string;
    date: string;
    completed: boolean;
  }) => {
    try {
      const response = await fetch("/api/dashboard/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok && result.task) {
        setTaskList((prev) => [...prev, result.task]);
      }
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch("/api/dashboard/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId }),
      });
      const result = await response.json();
      if (response.ok && result.id) {
        setTaskList((prev) => prev.filter((task) => task.id !== result.id));
      }
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const handleCreateCategory = async (name: string, color: string) => {
    try {
      const response = await fetch("/api/dashboard/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      const result = await response.json();
      if (response.ok && result.category) {
        setCategoryList((prev) => [...prev, result.category]);
      }
    } catch (error) {
      console.error("Failed to create category", error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch("/api/dashboard/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: categoryId }),
      });
      const result = await response.json();
      if (response.ok && result.id) {
        setCategoryList((prev) => prev.filter((category) => category.id !== result.id));
        setTaskList((prev) => prev.filter((task) => task.categoryId !== result.id));
      }
    } catch (error) {
      console.error("Failed to delete category", error);
    }
  };

  return (
    <div className="space-y-8">
      <WeeklySummary stats={weeklyStats} />
      <CategoryManager
        categories={categoryList}
        onCreateCategory={handleCreateCategory}
        onDeleteCategory={handleDeleteCategory}
      />
      <div className="border-t border-slate-800/50" />
      <DaysGrid
        days={dayProgressList}
        categories={categoryList}
        onCreateTask={handleCreateTask}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );
}
