"use client";

import React from "react";

export default function CategoryProductivity({ categories }: { categories: Array<{ id: string; name: string; percentage: number; color?: string }> }) {
  return (
    <div className="space-y-3">
      {categories.map((c) => (
        <div key={c.id} className="rounded-xl p-3 bg-slate-900/50 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div style={{ background: c.color || undefined }} className="w-3 h-3 rounded-full" />
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-slate-400">{c.percentage}%</p>
              </div>
            </div>
            <div className="w-1/2">
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div style={{ width: `${c.percentage}%`, background: c.color || "#10b981" }} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
