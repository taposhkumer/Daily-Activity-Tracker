"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { getContributionLevel } from "@/lib/analytics";
import { parseBangladeshYMD } from "@/lib/dateUtils";

type Day = {
  date: string;
  percentage: number;
  completedWeight?: number;
  totalWeight?: number;
  empty?: boolean;
};

const COLORS = [
  "bg-slate-700",
  "bg-emerald-200",
  "bg-emerald-300",
  "bg-emerald-500",
  "bg-emerald-700",
];

function monthName(i: number) {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i] || "";
}

export default function HeatmapGrid({ days }: { days: Day[] }) {
  const [hover, setHover] = useState<{ x: number; y: number; content: React.ReactNode } | null>(null);
  const blockSize = 28;
  const gapSize = 4;

  const { weeks, monthPositions, trackWidth } = useMemo(() => {
    if (!days || days.length === 0) return { weeks: [], monthPositions: {}, trackWidth: 0 };
    const first = parseBangladeshYMD(days[0].date);
    const startWeekday = first.getDay();
    const padStart = startWeekday;

    const padded: Day[] = [];
    for (let i = 0; i < padStart; i++) padded.push({ date: "", percentage: 0, empty: true });
    for (const d of days) padded.push(d);

    const remainder = padded.length % 7;
    if (remainder !== 0) {
      for (let i = 0; i < 7 - remainder; i++) padded.push({ date: "", percentage: 0, empty: true });
    }

    const weeksArr: Day[][] = [];
    for (let i = 0; i < padded.length; i += 7) weeksArr.push(padded.slice(i, i + 7));

    const monthPos: Record<string, number> = {};
    for (let i = 0; i < days.length; i++) {
      const d = days[i];
      if (!d.date) continue;
      const dt = parseBangladeshYMD(d.date);
      const m = dt.getMonth();
      if (monthPos[m] !== undefined) continue;
      const globalIndex = padStart + i;
      const weekIndex = Math.floor(globalIndex / 7);
      monthPos[m] = weekIndex;
    }

    const width = weeksArr.length * blockSize + Math.max(0, weeksArr.length - 1) * gapSize;
    return { weeks: weeksArr, monthPositions: monthPos, trackWidth: width };
  }, [days]);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4">
      <div className="mb-4 flex items-center justify-between gap-4 text-slate-400">
        <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Activity map</span>
        <span className="text-xs">Completion percentage shown on hover and large screens</span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max" style={{ width: trackWidth }}>
          <div className="mb-2 relative h-5">
            {Object.keys(monthPositions).map((mk) => {
              const mi = Number(mk);
              const pos = monthPositions[mi] ?? 0;
              return (
                <div
                  key={mk}
                  style={{ left: pos * (blockSize + gapSize), position: "absolute" }}
                  className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400"
                >
                  {monthName(mi)}
                </div>
              );
            })}
          </div>

          <div className="flex">
            <div className="hidden md:flex flex-col justify-between mr-3 h-49">
              <div className="text-[10px] text-slate-500">Sun</div>
              <div className="text-[10px] text-slate-500">Tue</div>
              <div className="text-[10px] text-slate-500">Thu</div>
              <div className="text-[10px] text-slate-500">Sat</div>
            </div>

            <div className="flex space-x-1 pb-2">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col space-y-1">
                  {week.map((d, di) => {
                    const level = getContributionLevel(d.percentage);
                    const color = d.empty ? "bg-slate-900/0" : COLORS[level] || COLORS[0];
                    return (
                      <motion.div
                        key={`${wi}-${di}-${d.date}`}
                        whileHover={d.empty ? {} : { scale: 1.05 }}
                        onMouseEnter={(e) =>
                          !d.empty &&
                          setHover({
                            x: e.clientX,
                            y: e.clientY,
                            content: (
                              <div className="text-sm">
                                <div className="font-medium">{d.date ? parseBangladeshYMD(d.date).toDateString() : ""}</div>
                                <div className="text-xs text-slate-300">Overall: {d.percentage}%</div>
                                <div className="text-xs text-slate-300">Completed: {d.completedWeight || 0}/{d.totalWeight || 0}</div>
                              </div>
                            ),
                          })
                        }
                        onMouseLeave={() => setHover(null)}
                        className={`w-7 h-7 flex items-center justify-center rounded-sm border border-slate-800/50 ${color} text-white text-[10px] md:text-xs`}
                      >
                        <span className="hidden md:inline">{d.empty ? "" : `${d.percentage}`}</span>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {hover ? (
        <div style={{ left: hover.x + 14, top: hover.y + 14 }} className="pointer-events-none fixed z-50">
          <div className="bg-slate-950/98 text-white text-sm p-3 rounded-2xl shadow-2xl border border-slate-800">
            {hover.content}
          </div>
        </div>
      ) : null}
    </div>
  );
}
