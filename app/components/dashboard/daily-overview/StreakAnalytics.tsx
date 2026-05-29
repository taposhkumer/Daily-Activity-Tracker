"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Zap, Sparkles } from "lucide-react";
import {
  calculateCurrentStreak,
  calculateBestStreak,
  countHighCompletionDays,
} from "@/lib/dailyAnalytics";
import { type Task } from "@/Types/DashboardTypes";

interface StreakAnalyticsProps {
  tasks: Task[];
}

export default function StreakAnalytics({ tasks }: StreakAnalyticsProps) {
  const currentStreak = useMemo(
    () => calculateCurrentStreak(tasks, 50),
    [tasks]
  );
  const bestStreak = useMemo(() => calculateBestStreak(tasks, 50), [tasks]);
  const highCompletionDays = useMemo(
    () => countHighCompletionDays(tasks, 80),
    [tasks]
  );

  const cards = [
    {
      icon: Zap,
      label: "Current Streak",
      value: currentStreak,
      unit: "days",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      iconBg: "bg-emerald-500/20",
    },
    {
      icon: Flame,
      label: "Best Streak",
      value: bestStreak,
      unit: "days",
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      iconBg: "bg-orange-500/20",
    },
    {
      icon: Sparkles,
      label: "80%+ Days",
      value: highCompletionDays,
      unit: "this month",
      color: "bg-red-500/10 text-red-400 border-red-500/20",
      iconBg: "bg-red-500/20",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0,
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
      className="space-y-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            variants={itemVariants}
            whileHover={{ scale: 1.01, y: -2 }}
            className={`rounded-xl border ${card.color} bg-slate-900/40 backdrop-blur-sm p-4 transition-all cursor-default`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-400">
                  {card.label}
                </p>
                <div className="mt-2 flex items-baseline gap-1">
                  <p className={`text-2xl font-bold ${card.color.split(" ")[1]}`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-500">{card.unit}</p>
                </div>
              </div>
              <div className={`rounded-lg ${card.iconBg} p-2.5`}>
                <Icon className="w-5 h-5 text-slate-100" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
