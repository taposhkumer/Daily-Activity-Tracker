import { Task, Category, CategoryProgress, DayProgress, WeeklyStats, HeatmapDay } from '@/Types/DashboardTypes';

/**
 * Calculate progress percentage using weighted formula:
 * (sum of completed task weights) / (sum of all task weights) × 100
 */
export const calculateWeightedProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;

  const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0);
  if (totalWeight === 0) return 0;

  const completedWeight = tasks
    .filter(task => task.completed)
    .reduce((sum, task) => sum + task.weight, 0);

  return Math.round((completedWeight / totalWeight) * 100);
};

/**
 * Calculate daily progress for a specific date
 */
export const calculateDayProgress = (
  date: string,
  tasks: Task[],
  categories: Category[]
): DayProgress => {
  const dayTasks = tasks.filter(task => task.date === date);
  const completedCount = dayTasks.filter(task => task.completed).length;
  const totalCount = dayTasks.length;

  // Create category progress breakdown
  const categoryProgress: CategoryProgress[] = categories.map(category => {
    const categoryTasks = dayTasks.filter(task => task.categoryId === category.id);
    const totalWeight = categoryTasks.reduce((sum, task) => sum + task.weight, 0);
    const completedWeight = categoryTasks
      .filter(task => task.completed)
      .reduce((sum, task) => sum + task.weight, 0);

    const percentage = totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100);

    return {
      categoryId: category.id,
      categoryName: category.name,
      categoryColor: category.color,
      percentage,
      completedWeight,
      totalWeight,
    };
  });

  const overallPercentage = calculateWeightedProgress(dayTasks);

  // Get day name
  const dateObj = new Date(date);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

  return {
    date,
    dayName,
    overallPercentage,
    categories: categoryProgress,
    tasks: dayTasks,
    completedCount,
    totalCount,
  };
};

/**
 * Calculate category-wise weekly progress
 */
export const calculateCategoryProgress = (
  tasks: Task[],
  categories: Category[]
): CategoryProgress[] => {
  return categories.map(category => {
    const categoryTasks = tasks.filter(task => task.categoryId === category.id);
    const totalWeight = categoryTasks.reduce((sum, task) => sum + task.weight, 0);
    const completedWeight = categoryTasks
      .filter(task => task.completed)
      .reduce((sum, task) => sum + task.weight, 0);

    const percentage = totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100);

    return {
      categoryId: category.id,
      categoryName: category.name,
      categoryColor: category.color,
      percentage,
      completedWeight,
      totalWeight,
    };
  });
};

/**
 * Get most productive day (highest completion percentage)
 */
export const getMostProductiveDay = (
  dateRange: string[],
  tasks: Task[]
): string => {
  let maxPercentage = -1;
  let mostProductiveDay = dateRange[0];

  dateRange.forEach(date => {
    const dayTasks = tasks.filter(task => task.date === date);
    const percentage = calculateWeightedProgress(dayTasks);

    if (percentage > maxPercentage) {
      maxPercentage = percentage;
      mostProductiveDay = date;
    }
  });

  const dateObj = new Date(mostProductiveDay);
  return dateObj.toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Get best performing category
 */
export const getBestCategory = (
  tasks: Task[],
  categories: Category[]
): string => {
  const categoryProgress = calculateCategoryProgress(tasks, categories);
  const bestCat = categoryProgress.reduce((prev, current) =>
    current.percentage > prev.percentage ? current : prev
  );
  return bestCat.categoryName;
};

/**
 * Get tasks by specific day
 */
export const getTasksByDay = (date: string, tasks: Task[]): Task[] => {
  return tasks.filter(task => task.date === date);
};

/**
 * Generate heatmap data for the week
 */
export const generateHeatmapData = (
  dateRange: string[],
  tasks: Task[]
): HeatmapDay[] => {
  return dateRange.map(date => {
    const dayTasks = tasks.filter(task => task.date === date);
    const percentage = calculateWeightedProgress(dayTasks);
    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

    return {
      date,
      dayName,
      percentage,
      intensity: Math.floor(percentage / 20), // 0-5 intensity levels
    };
  });
};

/**
 * Calculate weekly statistics
 */
export const calculateWeeklyStats = (
  dateRange: string[],
  tasks: Task[],
  categories: Category[]
): WeeklyStats => {
  const weekPercentage = calculateWeightedProgress(tasks);
  const categoryProgress = calculateCategoryProgress(tasks, categories);
  const mostProductiveDay = getMostProductiveDay(dateRange, tasks);
  const bestCategory = getBestCategory(tasks, categories);
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const heatmapData = generateHeatmapData(dateRange, tasks);

  return {
    weekPercentage,
    categoryProgress,
    mostProductiveDay,
    bestCategory,
    completedTasks,
    totalTasks,
    heatmapData,
  };
};
