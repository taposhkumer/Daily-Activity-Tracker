"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import GoalCard from "./GoalCard";
import GoalForm from "./GoalForm";

interface Goal {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  completed?: boolean;
  period: "week" | "month" | "year";
}

interface GoalsSectionProps {
  title: string;
  period: "week" | "month" | "year";
  goals: Goal[];
  onGoalAdded: (goal: Goal) => void;
  onGoalUpdated: (goal: Goal) => void;
  onGoalDeleted: (id: string) => void;
  emoji: string;
}

export default function GoalsSection({
  title,
  period,
  goals,
  onGoalAdded,
  onGoalUpdated,
  onGoalDeleted,
  emoji,
}: GoalsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEditClick = (goal: Goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleFormSubmit = async (formData: Omit<Goal, "_id">) => {
    try {
      setIsLoading(true);

      if (editingGoal) {
        // Update existing goal
        const response = await fetch("/api/goals", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingGoal._id,
            ...formData,
          }),
        });

        if (!response.ok) throw new Error("Failed to update goal");
        const data = await response.json();
        onGoalUpdated(data.goal);
      } else {
        // Create new goal
        const response = await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Failed to create goal");
        const data = await response.json();
        onGoalAdded(data.goal);
      }

      setShowForm(false);
      setEditingGoal(null);
    } catch (error) {
      console.error("Error submitting goal:", error);
      alert("Error saving goal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    try {
      const response = await fetch(`/api/goals?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete goal");
      onGoalDeleted(id);
    } catch (error) {
      console.error("Error deleting goal:", error);
      alert("Error deleting goal. Please try again.");
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const goal = goals.find((g) => g._id === id);
      if (!goal) return;

      const response = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          completed,
        }),
      });

      if (!response.ok) throw new Error("Failed to update goal");
      const data = await response.json();
      onGoalUpdated(data.goal);
    } catch (error) {
      console.error("Error toggling goal completion:", error);
    }
  };

  const completedCount = goals.filter((g) => g.completed).length;
  const totalCount = goals.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <span className="text-3xl">{emoji}</span>
            {title}
          </h2>
          {totalCount > 0 && (
            <p className="text-sm text-slate-400 mt-1">
              {completedCount} of {totalCount} completed
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setEditingGoal(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg hover:shadow-cyan-500/20"
        >
          <Plus className="w-5 h-5" />
          Add Goal
        </button>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / totalCount) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-linear-to-r from-cyan-500 to-emerald-500"
          />
        </div>
      )}

      {/* Goals Grid */}
      <AnimatePresence mode="popLayout">
        {goals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12 bg-slate-900/30 border border-slate-700/50 rounded-xl"
          >
            <p className="text-slate-400">No goals yet. Create one to get started!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal._id}
                goal={goal}
                onEdit={handleEditClick}
                onDelete={handleDeleteGoal}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <GoalForm
            period={period}
            initialGoal={editingGoal || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
