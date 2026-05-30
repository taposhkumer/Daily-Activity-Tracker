"use client";

import React, { useEffect, useMemo, useState } from "react";
import AnalyticsCards from "@/app/components/dashboard/AnalyticsCards";
import RewardAnalytics from "@/app/components/dashboard/RewardAnalytics";
import HeatmapGrid from "@/app/components/dashboard/HeatmapGrid";
import YearSelector from "@/app/components/dashboard/YearSelector";
import OverallProductivity from "@/app/components/dashboard/OverallProductivity";
import CategoryProductivity from "@/app/components/dashboard/CategoryProductivity";
import {
  extractYearsFromTasks,
  generateHeatmapData,
  calculateYearlyProgress,
  calculateCategoryProgress,
  calculateCurrentStreak,
  calculateBestStreak,
  countHighCompletionDays,
  getMostProductiveDay,
  getBestCategory,
} from "@/lib/analytics";
import { getBangladeshYear } from "@/lib/dateUtils";

export default function DashboardAnalytics() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [years, setYears] = useState<number[]>([getBangladeshYear()]);
  const [year, setYear] = useState<number>(getBangladeshYear());

  useEffect(() => {
    async function load() {
      try {
        const [tRes, cRes] = await Promise.all([fetch("/api/dashboard/tasks"), fetch("/api/dashboard/categories")]);
        const tj = await tRes.json();
        const cj = await cRes.json();
        const _tasks = tj.tasks || [];
        const _categories = cj.categories || [];
        setTasks(_tasks);
        setCategories(_categories);
        const ys = extractYearsFromTasks(_tasks);
        if (ys.length) {
          setYears(ys);
          setYear(ys[ys.length - 1]);
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const heatmapDays = useMemo(() => generateHeatmapData(year, tasks), [year, tasks]);

  const overall = useMemo(() => calculateYearlyProgress(year, tasks), [year, tasks]);

  const categoryProgress = useMemo(() => calculateCategoryProgress(tasks, categories.map((c) => ({ id: c.id.toString(), name: c.name }))), [tasks, categories]);

  const bestCategory = useMemo(() => getBestCategory(categoryProgress), [categoryProgress]);

  const streaksData = useMemo(() => {
    const days = heatmapDays.map((d) => ({ date: d.date, percentage: d.percentage }));
    return {
      currentStreak: calculateCurrentStreak(days, 50),
      bestStreak: calculateBestStreak(days, 50),
      days80: countHighCompletionDays(days, 80),
      mostProductiveDay: getMostProductiveDay(days),
    };
  }, [heatmapDays]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Productivity Analytics</h2>
        <YearSelector years={years} value={year} onChange={setYear} />
      </div>

      <AnalyticsCards
        currentStreak={streaksData.currentStreak}
        bestStreak={streaksData.bestStreak}
        days80={streaksData.days80}
        mostProductiveDay={streaksData.mostProductiveDay}
        bestCategory={bestCategory?.name || null}
        completedTasks={tasks.filter((t) => t.completed).length}
        totalTasks={tasks.length}
      />

      <div className="mt-4">
        <RewardAnalytics />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <OverallProductivity percentage={overall.percentage} />
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-sm text-slate-400">Overall Activity</h3>
            <div className="mt-4 overflow-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-slate-300 font-medium">Overall Activity</div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-slate-700 border border-slate-800" />
                    <span>0%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-emerald-200 border border-slate-800" />
                    <span>1–25%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-emerald-300 border border-slate-800" />
                    <span>26–50%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500 border border-slate-800" />
                    <span>51–75%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-emerald-700 border border-slate-800" />
                    <span>76–100%</span>
                  </div>
                </div>
              </div>

              <HeatmapGrid days={heatmapDays} />
            </div>
          </div>

          <div className="space-y-6">
            {categories.map((c) => (
              <div key={c.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <h4 className="text-sm text-slate-300">{c.name} Activity</h4>
                <div className="mt-3">
                  <HeatmapGrid days={generateHeatmapData(year, tasks.filter((t) => (t.categoryId || "") === c.id))} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h4 className="text-sm text-slate-400">Category Productivity</h4>
            <div className="mt-3">
              <CategoryProductivity categories={categoryProgress.map((p, i) => ({ ...p, color: categories[i]?.color }))} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h4 className="text-sm text-slate-400">Quick Insights</h4>
            <ul className="mt-3 text-sm space-y-2 text-slate-300">
              <li>Best category: {bestCategory?.name || "—"} ({bestCategory?.percentage || 0}%)</li>
              <li>Most productive day: {streaksData.mostProductiveDay}</li>
              <li>Current streak: {streaksData.currentStreak} days</li>
              <li>Best streak: {streaksData.bestStreak} days</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
