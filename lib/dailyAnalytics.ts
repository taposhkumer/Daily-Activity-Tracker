import { type Task } from "@/Types/DashboardTypes";
import { formatDateToBangladeshYMD, parseBangladeshYMD } from "@/lib/dateUtils";

export interface DailyStats {
  date: string; // YYYY-MM-DD
  completedWeight: number;
  totalWeight: number;
  percentage: number;
  byCategory: Record<
    string,
    { completedWeight: number; totalWeight: number; percentage: number }
  >;
}

/**
 * Calculate daily progress for all tasks
 */
export function calculateDailyProgress(
  tasks: Array<Task | Record<string, any>>
): Record<string, DailyStats> {
  const map: Record<string, Array<Task | Record<string, any>>> = {};

  for (const task of tasks) {
    if (!task.date) continue;
    const dateString = typeof task.date === "string" ? task.date : String(task.date);
    const date = formatDateToBangladeshYMD(parseBangladeshYMD(dateString));
    map[date] = map[date] || [];
    map[date].push(task);
  }

  const result: Record<string, DailyStats> = {};

  for (const date in map) {
    const taskList = map[date];
    let completedWeight = 0;
    let totalWeight = 0;
    const byCategory: Record<
      string,
      { completedWeight: number; totalWeight: number; percentage: number }
    > = {};

    for (const task of taskList) {
      const weight = typeof task.weight === "number" && task.weight > 0 ? task.weight : 1;
      totalWeight += weight;
      if (task.completed) completedWeight += weight;

      const categoryId = (task.categoryId || "uncategorized").toString();
      byCategory[categoryId] = byCategory[categoryId] || {
        completedWeight: 0,
        totalWeight: 0,
        percentage: 0,
      };
      byCategory[categoryId].totalWeight += weight;
      if (task.completed) byCategory[categoryId].completedWeight += weight;
    }

    for (const categoryId in byCategory) {
      const category = byCategory[categoryId];
      category.percentage =
        category.totalWeight === 0
          ? 0
          : Math.round((category.completedWeight / category.totalWeight) * 100);
    }

    const percentage =
      totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100);
    result[date] = { date, completedWeight, totalWeight, percentage, byCategory };
  }

  return result;
}

/**
 * Get tasks for a specific date
 */
export function getTasksByDate(
  tasks: Array<Task | Record<string, any>>,
  date: string
): Array<Task | Record<string, any>> {
  return tasks.filter((task) => {
    const taskDate = typeof task.date === "string" ? task.date : String(task.date);
    return formatDateToBangladeshYMD(parseBangladeshYMD(taskDate)) === date;
  });
}

/**
 * Calculate category-based progress for a specific date
 */
export function getCategoryProgressForDate(
  tasks: Array<Task | Record<string, any>>,
  date: string,
  categories: Array<{ id: string; name: string; color: string }>
): Array<{ id: string; name: string; color: string; percentage: number; completedWeight: number; totalWeight: number }> {
  const dailyStats = calculateDailyProgress(tasks);
  const dayStats = dailyStats[date];

  if (!dayStats) {
    return categories.map((cat) => ({
      ...cat,
      percentage: 0,
      completedWeight: 0,
      totalWeight: 0,
    }));
  }

  return categories.map((cat) => {
    const catStats = dayStats.byCategory[cat.id] || {
      completedWeight: 0,
      totalWeight: 0,
      percentage: 0,
    };
    return {
      ...cat,
      ...catStats,
    };
  });
}

/**
 * Calculate current streak (consecutive days with >= 50% completion)
 */
export function calculateCurrentStreak(
  tasks: Array<Task | Record<string, any>>,
  minCompletionPercentage: number = 50
): number {
  const dailyStats = calculateDailyProgress(tasks);
  const dates = Object.keys(dailyStats).sort().reverse();

  let streak = 0;
  const today = formatDateToBangladeshYMD(parseBangladeshYMD(new Date()));

  for (const date of dates) {
    // Only count from today backwards
    if (date > today) continue;

    const stat = dailyStats[date];
    if (stat && stat.percentage >= minCompletionPercentage) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculate best/longest streak (consecutive days with >= 50% completion)
 */
export function calculateBestStreak(
  tasks: Array<Task | Record<string, any>>,
  minCompletionPercentage: number = 50
): number {
  const dailyStats = calculateDailyProgress(tasks);
  const dates = Object.keys(dailyStats).sort();

  let maxStreak = 0;
  let currentStreak = 0;

  for (const date of dates) {
    const stat = dailyStats[date];
    if (stat && stat.percentage >= minCompletionPercentage) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
}

/**
 * Count days with completion >= 80% in current month
 */
export function countHighCompletionDays(
  tasks: Array<Task | Record<string, any>>,
  minCompletionPercentage: number = 80
): number {
  const dailyStats = calculateDailyProgress(tasks);
  const today = parseBangladeshYMD(new Date());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const startDate = formatDateToBangladeshYMD(monthStart);
  const endDate = formatDateToBangladeshYMD(monthEnd);

  let count = 0;
  for (const date in dailyStats) {
    if (date >= startDate && date <= endDate) {
      if (dailyStats[date].percentage >= minCompletionPercentage) {
        count++;
      }
    }
  }

  return count;
}

/**
 * Determine completion level (none, low, medium, high)
 */
export function calculateCompletionLevel(
  percentage: number
): "none" | "low" | "medium" | "high" {
  if (percentage === 0) return "none";
  if (percentage < 25) return "low";
  if (percentage < 75) return "medium";
  return "high";
}

/**
 * Get all dates in a month with their completion levels
 */
export function getMonthCompletionMap(
  tasks: Array<Task | Record<string, any>>,
  year: number,
  month: number // 0-11
): Record<string, DailyStats & { level: "none" | "low" | "medium" | "high" }> {
  const dailyStats = calculateDailyProgress(tasks);
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const result: Record<
    string,
    DailyStats & { level: "none" | "low" | "medium" | "high" }
  > = {};

  for (let date = new Date(monthStart); date <= monthEnd; date.setDate(date.getDate() + 1)) {
    const dateStr = formatDateToBangladeshYMD(new Date(date));
    const stat = dailyStats[dateStr];

    if (stat) {
      result[dateStr] = {
        ...stat,
        level: calculateCompletionLevel(stat.percentage),
      };
    } else {
      result[dateStr] = {
        date: dateStr,
        completedWeight: 0,
        totalWeight: 0,
        percentage: 0,
        byCategory: {},
        level: "none",
      };
    }
  }

  return result;
}
