import { type TaskDocument } from "@/app/Models/TaskSchema";
import { formatDateToBangladeshYMD, parseBangladeshYMD, getBangladeshWeekday, getBangladeshYear } from "@/lib/dateUtils";

type DayStat = {
  date: string; // YYYY-MM-DD
  completedWeight: number;
  totalWeight: number;
  percentage: number; // 0-100
  byCategory: Record<string, { completedWeight: number; totalWeight: number; percentage: number }>;
};

function toYMD(date: Date) {
  return formatDateToBangladeshYMD(date);
}

export function groupTasksByDate(tasks: Array<Partial<TaskDocument>>) {
  const map: Record<string, Array<Partial<TaskDocument>>> = {};
  for (const t of tasks) {
    if (!t.date) continue;
    const dateString = typeof t.date === "string" ? t.date : String(t.date);
    const d = formatDateToBangladeshYMD(parseBangladeshYMD(dateString));
    map[d] = map[d] || [];
    map[d].push(t);
  }
  return map;
}

export function calculateDailyProgress(tasks: Array<Partial<TaskDocument>>) {
  const grouped = groupTasksByDate(tasks);
  const out: Record<string, DayStat> = {};
  for (const date in grouped) {
    const list = grouped[date];
    let completedWeight = 0;
    let totalWeight = 0;
    const byCategory: Record<string, { completedWeight: number; totalWeight: number; percentage: number }> = {};
    for (const t of list) {
      const w = typeof t.weight === "number" && t.weight > 0 ? t.weight : 1;
      totalWeight += w;
      if (t.completed) completedWeight += w;
      const cid = (t.categoryId || "uncategorized").toString();
      byCategory[cid] = byCategory[cid] || { completedWeight: 0, totalWeight: 0, percentage: 0 };
      byCategory[cid].totalWeight += w;
      if (t.completed) byCategory[cid].completedWeight += w;
    }
    for (const cid in byCategory) {
      const c = byCategory[cid];
      c.percentage = c.totalWeight === 0 ? 0 : Math.round((c.completedWeight / c.totalWeight) * 100);
    }
    const percentage = totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100);
    out[date] = { date, completedWeight, totalWeight, percentage, byCategory };
  }
  return out;
}

export function generateHeatmapData(year: number, tasks: Array<Partial<TaskDocument>>) {
  const start = parseBangladeshYMD(`${year}-01-01`);
  const end = parseBangladeshYMD(`${year}-12-31`);
  const daily = calculateDailyProgress(tasks);
  const days: DayStat[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const date = toYMD(new Date(d));
    if (daily[date]) days.push(daily[date]);
    else days.push({ date, completedWeight: 0, totalWeight: 0, percentage: 0, byCategory: {} });
  }
  return days;
}

export function generateCategoryHeatmap(year: number, tasks: Array<Partial<TaskDocument>>, categoryId: string) {
  const filtered = tasks.filter((t) => (t.categoryId || "").toString() === categoryId);
  return generateHeatmapData(year, filtered);
}

export function calculateYearlyProgress(year: number, tasks: Array<Partial<TaskDocument>>) {
  const days = generateHeatmapData(year, tasks);
  let totalCompleted = 0;
  let totalWeight = 0;
  for (const d of days) {
    totalCompleted += d.completedWeight;
    totalWeight += d.totalWeight;
  }
  const percentage = totalWeight === 0 ? 0 : Math.round((totalCompleted / totalWeight) * 100);
  return { year, totalCompleted, totalWeight, percentage };
}

export function calculateCategoryProgress(tasks: Array<Partial<TaskDocument>>, categories: Array<{ id: string; name?: string }>) {
  const daily = calculateDailyProgress(tasks);
  const catTotals: Record<string, { completedWeight: number; totalWeight: number }> = {};
  for (const date in daily) {
    const stat = daily[date];
    for (const cid in stat.byCategory) {
      catTotals[cid] = catTotals[cid] || { completedWeight: 0, totalWeight: 0 };
      catTotals[cid].completedWeight += stat.byCategory[cid].completedWeight;
      catTotals[cid].totalWeight += stat.byCategory[cid].totalWeight;
    }
  }
  return categories.map((c) => {
    const t = catTotals[c.id] || { completedWeight: 0, totalWeight: 0 };
    const percentage = t.totalWeight === 0 ? 0 : Math.round((t.completedWeight / t.totalWeight) * 100);
    return { id: c.id, name: c.name || "Unnamed", completedWeight: t.completedWeight, totalWeight: t.totalWeight, percentage };
  });
}

export function calculateCurrentStreak(days: Array<{ date: string; percentage: number }>, threshold = 50) {
  const sorted = days.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  let streak = 0;
  for (const d of sorted) {
    if (d.percentage >= threshold) streak++;
    else break;
  }
  return streak;
}

export function calculateBestStreak(days: Array<{ date: string; percentage: number }>, threshold = 50) {
  let best = 0;
  let cur = 0;
  const sorted = days.slice().sort((a, b) => (a.date > b.date ? 1 : -1));
  for (const d of sorted) {
    if (d.percentage >= threshold) cur++;
    else {
      if (cur > best) best = cur;
      cur = 0;
    }
  }
  if (cur > best) best = cur;
  return best;
}

export function countHighCompletionDays(days: Array<{ date: string; percentage: number }>, minPercent = 80) {
  return days.filter((d) => d.percentage >= minPercent).length;
}

export function getMostProductiveDay(days: Array<{ date: string; percentage: number }>) {
  const weekdayStats: Record<string, { total: number; count: number }> = {};
  for (const d of days) {
    const dayName = getBangladeshWeekday(d.date);
    weekdayStats[dayName] = weekdayStats[dayName] || { total: 0, count: 0 };
    weekdayStats[dayName].total += d.percentage;
    weekdayStats[dayName].count += 1;
  }
  let bestDay = "—";
  let bestAvg = -1;
  for (const dayName in weekdayStats) {
    const s = weekdayStats[dayName];
    const avg = s.total / s.count;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestDay = dayName;
    }
  }
  return bestDay;
}

export function getBestCategory(categoryProgress: Array<{ id: string; name: string; percentage: number }>) {
  if (!categoryProgress || categoryProgress.length === 0) return null;
  return categoryProgress.reduce((best, cur) => (cur.percentage > best.percentage ? cur : best), categoryProgress[0]);
}

export function getContributionLevel(percentage: number) {
  if (percentage <= 0) return 0;
  if (percentage <= 25) return 1;
  if (percentage <= 50) return 2;
  if (percentage <= 75) return 3;
  return 4;
}

export function extractYearsFromTasks(tasks: Array<Partial<TaskDocument>>) {
  const set = new Set<number>();
  for (const t of tasks) {
    if (!t.date) continue;
    const dateString = typeof t.date === "string" ? t.date : String(t.date);
    const y = getBangladeshYear(parseBangladeshYMD(dateString));
    set.add(y);
  }
  return Array.from(set).sort((a, b) => a - b);
}

export default {};
