"use client";

import { CategoryProgress } from "@/Types/DashboardTypes";

interface CategoryBarsProps {
  categories: CategoryProgress[];
  size?: "sm" | "md";
}

const categoryColorMap: Record<string, string> = {
  Study: "from-purple-400 to-indigo-500",
  Health: "from-emerald-400 to-green-500",
  Coding: "from-orange-400 to-red-500",
  Reading: "from-pink-400 to-rose-500",
};

export default function CategoryBars({ categories, size = "sm" }: CategoryBarsProps) {
  const barHeight = size === "sm" ? "h-5" : "h-6";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="space-y-3">
      {categories.map((cat) => (
        <div key={cat.categoryId} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className={`font-medium text-slate-300 ${textSize}`}>
              {cat.categoryName}
            </span>
            <span className={`font-semibold text-slate-100 ${textSize}`}>
              {cat.percentage}%
            </span>
          </div>
          <div className={`w-full rounded-full bg-slate-800/50 overflow-hidden ${barHeight}`}>
            <div
              className={`h-full rounded-full bg-linear-to-r ${categoryColorMap[cat.categoryName] || "from-cyan-400 to-blue-500"} transition-all duration-500`}
              style={{ width: `${cat.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
