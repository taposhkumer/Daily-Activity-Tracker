"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Zap } from "lucide-react";
import { type TaskDocument } from "@/app/Models/TaskSchema";
import { type Category, type Task } from "@/Types/DashboardTypes";

interface TodayTasksListProps {
  tasks: Task[];
  categories: Category[];
  onToggleTask?: (taskId: string, completed: boolean) => void;
}

export default function TodayTasksList({
  tasks,
  categories,
  onToggleTask,
}: TodayTasksListProps) {
  const categoryMap = useMemo(() => {
    const map: Record<string, Category> = {};
    for (const cat of categories) {
      map[cat.id] = cat;
    }
    return map;
  }, [categories]);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400 text-sm">No tasks for today</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="space-y-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {tasks.map((task) => {
        const category = categoryMap[task.categoryId];
        const categoryColor = {
          purple: "bg-purple-500/20 text-purple-300 border-purple-500/30",
          emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
          orange: "bg-orange-500/20 text-orange-300 border-orange-500/30",
          pink: "bg-pink-500/20 text-pink-300 border-pink-500/30",
          blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
          red: "bg-red-500/20 text-red-300 border-red-500/30",
          cyan: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
          yellow: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        } as Record<string, string>;

        return (
          <motion.div
            key={task.id}
            variants={itemVariants}
            whileHover={{ scale: 1.01, x: 4 }}
            className="group flex items-center gap-3 p-3 rounded-lg bg-slate-900/30 border border-slate-700/50 hover:border-slate-600/70 transition-all cursor-pointer"
            onClick={() => onToggleTask?.(task.id, !task.completed)}
          >
            {/* Checkbox */}
            <motion.div
              whileHover={{ scale: 1.15 }}
              className="shrink-0"
            >
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500 group-hover:text-slate-400" />
              )}
            </motion.div>

            {/* Task Title */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium truncate ${
                  task.completed
                    ? "text-slate-500 line-through"
                    : "text-slate-100"
                }`}
              >
                {task.title}
              </p>
            </div>

            {/* Weight */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-amber-300">
                {task.weight}
              </span>
            </div>

            {/* Category Badge */}
            {category && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-2 py-1 rounded-md text-xs font-medium border ${
                  categoryColor[category.color as keyof typeof categoryColor] ||
                  "bg-slate-500/20 text-slate-300 border-slate-500/30"
                }`}
              >
                {category.name}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
