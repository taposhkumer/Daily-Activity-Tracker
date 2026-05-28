"use client";

import React from "react";

export default function YearSelector({ years, value, onChange }: { years: number[]; value: number; onChange: (y: number) => void }) {
  return (
    <div className="inline-flex items-center gap-3">
      <label className="text-sm text-slate-400">Year</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-slate-900/60 border border-slate-800 rounded-md px-3 py-1 text-sm"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
