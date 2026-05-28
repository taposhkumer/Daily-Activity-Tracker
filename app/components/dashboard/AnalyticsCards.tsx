"use client";

import { Flame, Target, CheckCircle2, Activity, CalendarDays } from "lucide-react";

interface AnalyticsCardsProps {
  currentStreak: number;
  bestStreak: number;
  days80: number;
  mostProductiveDay: string;
  bestCategory: string | null;
  completedTasks: number;
  totalTasks: number;
}

export default function AnalyticsCards({
  currentStreak,
  bestStreak,
  days80,
  mostProductiveDay,
  bestCategory,
  completedTasks,
  totalTasks,
}: AnalyticsCardsProps) {
  const cards = [
    { icon: Activity, label: "Current Streak", value: `${currentStreak} days`, color: "bg-emerald-500/10 text-emerald-400", borderColor: "border-emerald-500/20" },
    { icon: Flame, label: "Best Streak", value: `${bestStreak} days`, color: "bg-orange-500/10 text-orange-400", borderColor: "border-orange-500/20" },
    { icon: CalendarDays, label: "80%+ days this month", value: `${days80} days`, color: "bg-sky-500/10 text-sky-400", borderColor: "border-sky-500/20" },
    { icon: Flame, label: "Most productive day", value: mostProductiveDay, color: "bg-violet-500/10 text-violet-400", borderColor: "border-violet-500/20" },
    { icon: Target, label: "Best category", value: bestCategory || "—", color: "bg-purple-500/10 text-purple-400", borderColor: "border-purple-500/20" },
    { icon: CheckCircle2, label: "Completed tasks", value: `${completedTasks}/${totalTasks}`, color: "bg-emerald-500/10 text-emerald-400", borderColor: "border-emerald-500/20" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon as any;
        return (
          <div key={idx} className={`rounded-2xl border ${card.borderColor} bg-slate-900/60 p-4 backdrop-blur-sm transition-all hover:scale-[1.01]`}> 
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-400">{card.label}</p>
                <p className={`mt-2 text-lg font-semibold ${card.color}`}>{card.value}</p>
              </div>
              <div className={`rounded-lg ${card.color} p-2.5`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
