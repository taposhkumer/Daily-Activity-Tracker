"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Edit2, CheckCircle2, Circle } from "lucide-react";
import Image from "next/image";

interface Goal {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  completed?: boolean;
}

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
}

export default function GoalCard({
  goal,
  onEdit,
  onDelete,
  onToggleComplete,
}: GoalCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(goal._id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group relative bg-slate-900/60 border border-slate-700/50 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10"
    >
      {/* Image Section */}
      {goal.imageUrl && (
        <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
          <Image
            src={goal.imageUrl}
            alt={goal.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent" />
        </div>
      )}

      {/* Content Section */}
      <div className="p-5 space-y-3">
        {/* Header with title and completed toggle */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3
              className={`font-semibold text-base line-clamp-2 ${
                goal.completed ? "line-through text-slate-500" : "text-slate-100"
              }`}
            >
              {goal.title}
            </h3>
          </div>
          <button
            onClick={() => onToggleComplete(goal._id, !goal.completed)}
            className="shrink-0 text-slate-400 hover:text-cyan-400 transition-colors"
            title={goal.completed ? "Mark as incomplete" : "Mark as complete"}
          >
            {goal.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Description */}
        {goal.description && (
          <p className="text-sm text-slate-400 line-clamp-2">{goal.description}</p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => onEdit(goal)}
            className="flex-1 px-3 py-2 text-sm font-medium bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/30 transition-colors flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-3 py-2 text-sm font-medium bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>

        {/* Completion status */}
        {goal.completed && (
          <div className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full w-fit">
            ✓ Completed
          </div>
        )}
      </div>
    </motion.div>
  );
}
