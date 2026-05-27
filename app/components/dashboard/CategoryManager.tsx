"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Category } from "@/Types/DashboardTypes";

interface CategoryManagerProps {
  categories: Category[];
  onCreateCategory: (name: string, color: string) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const defaultColorOptions = [
  "#7c3aed",
  "#22c55e",
  "#38bdf8",
  "#f97316",
  "#ec4899",
];

export default function CategoryManager({
  categories,
  onCreateCategory,
  onDeleteCategory,
}: CategoryManagerProps) {
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState(defaultColorOptions[0]);

  const handleCreate = () => {
    if (!categoryName.trim()) return;
    onCreateCategory(categoryName.trim(), categoryColor);
    setCategoryName("");
  };

  return (
    <div className="rounded-2xl border border-slate-800/50 bg-slate-900/60 p-6 backdrop-blur-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Category management</h2>
          <p className="text-sm text-slate-400">
            Create or remove categories for task classification.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] w-full max-w-md">
          <div className="grid gap-2">
            <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">New category</label>
            <input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Category name"
              className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"
            />
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {defaultColorOptions.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setCategoryColor(color)}
              className={`h-10 w-full rounded-2xl border-2 transition ${
                categoryColor === color
                  ? "border-white/80"
                  : "border-slate-800"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="grid gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-2xl border border-slate-800/50 bg-slate-950/80 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <div>
                  <p className="text-sm font-medium text-slate-100">{category.name}</p>
                  <p className="text-xs text-slate-500">{category.color}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDeleteCategory(category.id)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-rose-400"
                title="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
