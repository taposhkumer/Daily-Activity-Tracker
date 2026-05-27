"use client";

import { WeeklyStats } from "@/Types/DashboardTypes";
import OverallProgress from "./OverallProgress";
import CategoryBars from "./CategoryBars";
import WeeklyHeatmap from "./WeeklyHeatmap";
import AnalyticsCards from "./AnalyticsCards";

interface WeeklySummaryProps {
  stats: WeeklyStats;
}

export default function WeeklySummary({ stats }: WeeklySummaryProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Weekly Summary</h1>
        <p className="mt-1 text-slate-400">
          Track your progress across all categories
        </p>
      </div>

      {/* Overall Progress */}
      <div className="rounded-2xl border border-slate-800/50 bg-slate-900/60 p-6 backdrop-blur-sm">
        <OverallProgress
          percentage={stats.weekPercentage}
          label="Overall week progress"
          size="lg"
        />
      </div>

      {/* Analytics Cards */}
      <AnalyticsCards
        mostProductiveDay={stats.mostProductiveDay}
        bestCategory={stats.bestCategory}
        completedTasks={stats.completedTasks}
        totalTasks={stats.totalTasks}
      />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Progress */}
        <div className="rounded-2xl border border-slate-800/50 bg-slate-900/60 p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-slate-100">
            Category progress
          </h2>
          <div className="mt-4">
            <CategoryBars categories={stats.categoryProgress} size="md" />
          </div>
        </div>

        {/* Weekly Heatmap */}
        <div className="rounded-2xl border border-slate-800/50 bg-slate-900/60 p-6 backdrop-blur-sm">
          <WeeklyHeatmap data={stats.heatmapData} />
        </div>
      </div>
    </div>
  );
}
