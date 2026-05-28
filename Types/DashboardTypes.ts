export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  weight: number;
  completed: boolean;
  categoryId: string;
  date: string;
}

export interface DayProgress {
  date: string;
  dayName: string;
  overallPercentage: number;
  categories: CategoryProgress[];
  tasks: Task[];
  completedCount: number;
  totalCount: number;
}

export interface CategoryProgress {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  percentage: number;
  completedWeight: number;
  totalWeight: number;
}

export interface WeeklyStats {
  weekPercentage: number;
  categoryProgress: CategoryProgress[];
  mostProductiveDay: string;
  bestCategory: string;
  completedTasks: number;
  totalTasks: number;
  currentStreak: number;
  bestStreak: number;
  days80: number;
  heatmapData: HeatmapDay[];
}

export interface HeatmapDay {
  date: string;
  dayName: string;
  percentage: number;
  intensity: number;
}
