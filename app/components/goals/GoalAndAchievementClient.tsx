"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import GoalsSection from "./GoalsSection";

interface Goal {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  completed?: boolean;
  period: "week" | "month" | "year";
}

interface GoalAndAchievementClientProps {
  initialGoals: Goal[];
}

export default function GoalAndAchievementClient({
  initialGoals,
}: GoalAndAchievementClientProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);

  const weekGoals = goals.filter((g) => g.period === "week");
  const monthGoals = goals.filter((g) => g.period === "month");
  const yearGoals = goals.filter((g) => g.period === "year");

  const handleGoalAdded = useCallback((newGoal: Goal) => {
    setGoals((prev) => [newGoal, ...prev]);
  }, []);

  const handleGoalUpdated = useCallback((updatedGoal: Goal) => {
    setGoals((prev) =>
      prev.map((g) => (g._id === updatedGoal._id ? updatedGoal : g))
    );
  }, []);

  const handleGoalDeleted = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g._id !== id));
  }, []);

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.completed).length;

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-bold text-slate-100">
          🎯 Goals & Achievements
        </h1>
        <p className="text-slate-400">
          Set and track your goals across different timeframes
        </p>

        {/* Overall Stats */}
        {totalGoals > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
              <div className="text-sm text-slate-400">Total Goals</div>
              <div className="text-3xl font-bold text-cyan-400 mt-1">
                {totalGoals}
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
              <div className="text-sm text-slate-400">Completed</div>
              <div className="text-3xl font-bold text-emerald-400 mt-1">
                {completedGoals}
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
              <div className="text-sm text-slate-400">Completion Rate</div>
              <div className="text-3xl font-bold text-cyan-400 mt-1">
                {totalGoals > 0
                  ? Math.round((completedGoals / totalGoals) * 100)
                  : 0}
                %
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Goals Sections */}
      <div className="space-y-16">
        {/* This Week's Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/30 border border-slate-700/30 rounded-2xl p-8"
        >
          <GoalsSection
            title="This Week's Goals"
            period="week"
            goals={weekGoals}
            emoji="📅"
            onGoalAdded={handleGoalAdded}
            onGoalUpdated={handleGoalUpdated}
            onGoalDeleted={handleGoalDeleted}
          />
        </motion.div>

        {/* This Month's Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/30 border border-slate-700/30 rounded-2xl p-8"
        >
          <GoalsSection
            title="This Month's Goals"
            period="month"
            goals={monthGoals}
            emoji="📊"
            onGoalAdded={handleGoalAdded}
            onGoalUpdated={handleGoalUpdated}
            onGoalDeleted={handleGoalDeleted}
          />
        </motion.div>

        {/* This Year's Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/30 border border-slate-700/30 rounded-2xl p-8"
        >
          <GoalsSection
            title="This Year's Goals"
            period="year"
            goals={yearGoals}
            emoji="🎆"
            onGoalAdded={handleGoalAdded}
            onGoalUpdated={handleGoalUpdated}
            onGoalDeleted={handleGoalDeleted}
          />
        </motion.div>
      </div>
    </div>
  );
}
