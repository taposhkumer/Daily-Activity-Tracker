"use client";

import { HeatmapDay } from "@/Types/DashboardTypes";

interface WeeklyHeatmapProps {
  data: HeatmapDay[];
}

export default function WeeklyHeatmap({ data }: WeeklyHeatmapProps) {
  const getIntensityColor = (intensity: number) => {
    const colors = [
      "bg-slate-800", // 0%
      "bg-cyan-900", // 1-20%
      "bg-cyan-700", // 21-40%
      "bg-cyan-600", // 41-60%
      "bg-cyan-500", // 61-80%
      "bg-cyan-400", // 81-100%
    ];
    return colors[intensity] || colors[0];
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-100">Weekly heatmap</h3>
      <div className="flex items-end justify-between gap-2">
        {data.map((day) => (
          <div
            key={day.date}
            className="flex flex-col items-center gap-2 flex-1"
          >
            <div
              className={`w-full aspect-square rounded-lg ${getIntensityColor(
                day.intensity
              )} transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/50 cursor-pointer`}
              title={`${day.dayName}: ${day.percentage}%`}
            />
            <span className="text-xs font-medium text-slate-400">
              {day.dayName}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-2.5 w-2.5 rounded-sm ${getIntensityColor(i)}`}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
