"use client";

import React from "react";
import { motion } from "framer-motion";
import ProgressBar from "./ProgressBar";

interface CategoryProgress {
  id: string;
  name: string;
  color: string;
  percentage: number;
  completedWeight: number;
  totalWeight: number;
}

interface CategoryProgressListProps {
  categories: CategoryProgress[];
}

export default function CategoryProgressList({
  categories,
}: CategoryProgressListProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-slate-400 text-sm">No categories</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  const colorMap = {
    purple: "bg-purple-500/20 border-purple-500/30",
    emerald: "bg-emerald-500/20 border-emerald-500/30",
    orange: "bg-orange-500/20 border-orange-500/30",
    pink: "bg-pink-500/20 border-pink-500/30",
    blue: "bg-blue-500/20 border-blue-500/30",
    red: "bg-red-500/20 border-red-500/30",
    cyan: "bg-cyan-500/20 border-cyan-500/30",
    yellow: "bg-yellow-500/20 border-yellow-500/30",
  } as Record<string, string>;

  const textColorMap = {
    purple: "text-purple-300",
    emerald: "text-emerald-300",
    orange: "text-orange-300",
    pink: "text-pink-300",
    blue: "text-blue-300",
    red: "text-red-300",
    cyan: "text-cyan-300",
    yellow: "text-yellow-300",
  } as Record<string, string>;

  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {categories.map((category) => (
        <motion.div
          key={category.id}
          variants={itemVariants}
          className={`p-4 rounded-lg border ${
            colorMap[category.color as keyof typeof colorMap] ||
            "bg-slate-500/20 border-slate-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3
              className={`text-sm font-semibold ${
                textColorMap[category.color as keyof typeof textColorMap] ||
                "text-slate-300"
              }`}
            >
              {category.name}
            </h3>
            <span className="text-xs font-medium text-slate-400">
              {category.completedWeight}/{category.totalWeight}
            </span>
          </div>
          <ProgressBar
            percentage={category.percentage}
            showLabel={true}
            animated={false}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
