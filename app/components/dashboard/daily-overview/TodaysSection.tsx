"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  getBangladeshWeekday,
  formatDateToBangladeshYMD,
} from "@/lib/dateUtils";
import ProgressBar from "./ProgressBar";
import TodayTasksList from "./TodayTasksList";
import CategoryProgressList from "./CategoryProgressList";
import { getCategoryProgressForDate } from "@/lib/dailyAnalytics";
import { type Category, type Task } from "@/Types/DashboardTypes";

interface TodaysSectionProps {
  date: string; // YYYY-MM-DD
  tasks: Task[];
  categories: Category[];
  onToggleTask?: (taskId: string, completed: boolean) => void;
}

export default function TodaysSection({
  date,
  tasks,
  categories,
  onToggleTask,
}: TodaysSectionProps) {
  const dayName = useMemo(() => {
    try {
      return getBangladeshWeekday(date).split(",")[0];
    } catch {
      return "Unknown";
    }
  }, [date]);

  const categoryProgress = useMemo(() => {
    return getCategoryProgressForDate(tasks, date, categories);
  }, [tasks, date, categories]);

  const totalProgress = useMemo(() => {
    let completedWeight = 0;
    let totalWeight = 0;

    for (const task of tasks) {
      const weight =
        typeof task.weight === "number" && task.weight > 0 ? task.weight : 1;
      totalWeight += weight;
      if (task.completed) completedWeight += weight;
    }

    return totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100);
  }, [tasks]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Today • {dayName}, {date}
        </h2>
      </div>

      {tasks.length === 0 ? (
        // Empty State
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="py-16 flex flex-col items-center justify-center"
        >
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">No tasks planned for today</p>
            <p className="text-slate-500 text-xs">Start planning your day to see progress</p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">
                Overall Progress
              </h3>
              <span className="text-xs font-semibold text-emerald-400">
                {totalProgress}%
              </span>
            </div>
            <ProgressBar percentage={totalProgress} showLabel={false} animated={true} />
          </motion.div>

          {/* Category-Based Progress */}
          {categoryProgress.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-3"
            >
              <h3 className="text-sm font-semibold text-slate-100">
                Category Progress
              </h3>
              <CategoryProgressList categories={categoryProgress} />
            </motion.div>
          )}

          {/* Tasks List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-semibold text-slate-100">Today's Tasks</h3>
            <TodayTasksList
              tasks={tasks}
              categories={categories}
              onToggleTask={onToggleTask}
            />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
