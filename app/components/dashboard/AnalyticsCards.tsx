"use client";

import { Flame, Target, CheckCircle2 } from "lucide-react";

interface AnalyticsCardsProps {
  mostProductiveDay: string;
  bestCategory: string;
  completedTasks: number;
  totalTasks: number;
}

export default function AnalyticsCards({
  mostProductiveDay,
  bestCategory,
  completedTasks,
  totalTasks,
}: AnalyticsCardsProps) {
  const cards = [
    {
      icon: Flame,
      label: "Most productive day",
      value: mostProductiveDay,
      color: "bg-orange-500/10 text-orange-400",
      borderColor: "border-orange-500/20",
    },
    {
      icon: Target,
      label: "Best category",
      value: bestCategory,
      color: "bg-purple-500/10 text-purple-400",
      borderColor: "border-purple-500/20",
    },
    {
      icon: CheckCircle2,
      label: "Completed tasks",
      value: `${completedTasks}/${totalTasks}`,
      color: "bg-emerald-500/10 text-emerald-400",
      borderColor: "border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`rounded-2xl border ${card.borderColor} bg-slate-900/60 p-4 backdrop-blur-sm transition-all hover:bg-slate-900/80`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-400">{card.label}</p>
                <p className={`mt-2 text-lg font-semibold ${card.color}`}>
                  {card.value}
                </p>
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
