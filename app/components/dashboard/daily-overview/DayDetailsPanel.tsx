"use client";

import React, { useMemo } from "react";
import { useGlobalContext } from "@/contextApi";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, TrendingUp } from "lucide-react";
import {
  getBangladeshWeekday,
  formatDateToBangladeshYMD,
} from "@/lib/dateUtils";
import ProgressBar from "./ProgressBar";
import CategoryProgressList from "./CategoryProgressList";
import TodayTasksList from "./TodayTasksList";
import { getCategoryProgressForDate } from "@/lib/dailyAnalytics";
import { type Category, type Task } from "@/Types/DashboardTypes";

interface DayDetailsPanelProps {
  date: string | null;
  tasks: Task[];
  categories: Category[];
  isOpen?: boolean;
  onClose?: () => void;
}

export default function DayDetailsPanel({
  date,
  tasks,
  categories,
  isOpen = true,
  onClose,
}: DayDetailsPanelProps) {
  const { refreshPendingRewards } = useGlobalContext();
  const dayName = useMemo(() => {
    if (!date) return "";
    try {
      return getBangladeshWeekday(date);
    } catch {
      return date;
    }
  }, [date]);

  const tasksForDate = useMemo(() => {
    if (!date) return [];
    return tasks.filter((task) => {
      const taskDate =
        typeof task.date === "string" ? task.date : String(task.date);
      return formatDateToBangladeshYMD(new Date(taskDate)) === date;
    });
  }, [tasks, date]);

  const categoryProgress = useMemo(() => {
    if (!date) return [];
    return getCategoryProgressForDate(tasks, date, categories);
  }, [tasks, date, categories]);

  const totalProgress = useMemo(() => {
    let completedWeight = 0;
    let totalWeight = 0;

    for (const task of tasksForDate) {
      const weight =
        typeof task.weight === "number" && task.weight > 0 ? task.weight : 1;
      totalWeight += weight;
      if (task.completed) completedWeight += weight;
    }

    return totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100);
  }, [tasksForDate]);

  if (!date || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-slate-950 border-l border-slate-700/50 shadow-2xl overflow-y-auto z-50"
          >
            {/* Header */}
            <div className="sticky top-0 bg-slate-950/95 backdrop-blur-sm border-b border-slate-700/50 p-6 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <h2 className="text-lg font-semibold text-slate-100">
                    {dayName}
                  </h2>
                </div>
                <p className="text-sm text-slate-500">{date}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-all text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {tasksForDate.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="py-12 flex flex-col items-center justify-center text-center"
                >
                  <div className="text-slate-400 mb-3">
                    <TrendingUp className="w-8 h-8 mx-auto opacity-50" />
                  </div>
                  <p className="text-slate-400 text-sm mb-1">No tasks on this day</p>
                  <p className="text-slate-500 text-xs">
                    This day is free to plan
                  </p>
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
                    <ProgressBar
                      percentage={totalProgress}
                      showLabel={false}
                      animated={false}
                    />
                  </motion.div>

                  {/* Category Progress */}
                  {categoryProgress.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="space-y-3"
                    >
                      <h3 className="text-sm font-semibold text-slate-100">
                        By Category
                      </h3>
                      <CategoryProgressList categories={categoryProgress} />
                    </motion.div>
                  )}

                  {/* Tasks */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="space-y-3"
                  >
                    <h3 className="text-sm font-semibold text-slate-100">
                      Tasks ({tasksForDate.length})
                    </h3>
                    <TodayTasksList
                      tasks={tasksForDate}
                      categories={categories}
                      onToggleTask={async (taskId: string, completed: boolean) => {
                        if (completed && date) {
                          try {
                            await fetch('/api/rewards/check-immediate', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ date }),
                            });
                            if (refreshPendingRewards) await refreshPendingRewards();
                          } catch (e) {
                            // ignore
                          }
                        }
                      }}
                    />
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
