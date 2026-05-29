"use client";

import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  percentage: number;
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export default function ProgressBar({
  percentage,
  className = "",
  showLabel = true,
  animated = true,
}: ProgressBarProps) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className={className}>
      <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden border border-slate-600/30">
        <motion.div
          className="h-full bg-linear-to-r from-emerald-400 to-cyan-400"
          initial={animated ? { width: 0 } : { width: `${clampedPercentage}%` }}
          animate={{ width: `${clampedPercentage}%` }}
          transition={
            animated
              ? { duration: 1, ease: "easeOut", delay: 0.2 }
              : { duration: 0.5 }
          }
        />
      </div>
      {showLabel && (
        <div className="mt-2 text-right">
          <span className="text-sm font-semibold text-slate-300">
            {clampedPercentage}%
          </span>
        </div>
      )}
    </div>
  );
}
