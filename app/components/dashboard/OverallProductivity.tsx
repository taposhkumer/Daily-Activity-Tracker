"use client";

import React from "react";
import { motion } from "framer-motion";

export default function OverallProductivity({ percentage }: { percentage: number }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Overall Productivity</p>
          <p className="mt-2 text-3xl font-semibold">{percentage}%</p>
        </div>
        <div className="w-2/5">
          <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              className="h-4 bg-emerald-500"
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
