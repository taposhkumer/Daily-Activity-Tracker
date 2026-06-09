import { formatDateToBangladeshYMD, parseBangladeshYMD } from "./dateUtils";

const EVENING_CHECK_TIME = 22; // 10:00 PM

export function shouldCheckEveningNotification(): boolean {
  const now = new Date();
  const bangladeshTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
  
  // Check if current time is between 10:00 PM and 10:30 PM
  const hour = bangladeshTime.getHours();
  const minute = bangladeshTime.getMinutes();
  
  return hour === EVENING_CHECK_TIME && minute < 30;
}

export function getYesterdayDate(): string {
  const today = parseBangladeshYMD(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDateToBangladeshYMD(yesterday);
}

export async function fetchYesterdayCompletion(): Promise<{
  date: string;
  productivity: number;
  rewards: any[];
} | null> {
  try {
    const yesterday = getYesterdayDate();
    
    const response = await fetch('/api/dashboard/tasks', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const tasks = Array.isArray(data) ? data : data.tasks || [];
    
    // Filter tasks for yesterday
    const yesterdayTasks = tasks.filter((task: any) => task.date === yesterday);
    
    if (yesterdayTasks.length === 0) return null;

    // Calculate productivity
    let totalWeight = 0;
    let completedWeight = 0;
    
    for (const task of yesterdayTasks) {
      const weight = typeof task.weight === "number" && task.weight > 0 ? task.weight : 1;
      totalWeight += weight;
      if (task.completed) completedWeight += weight;
    }

    const productivity = totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100);

    // Fetch pending rewards for yesterday
    const rewardsResponse = await fetch(`/api/rewards/pending?date=${yesterday}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    let rewards: any[] = [];
    if (rewardsResponse.ok) {
      const rewardsData = await rewardsResponse.json();
      rewards = Array.isArray(rewardsData) ? rewardsData : rewardsData.rewards || [];
    }

    return {
      date: yesterday,
      productivity,
      rewards,
    };
  } catch (error) {
    console.error('Error fetching yesterday completion:', error);
    return null;
  }
}
